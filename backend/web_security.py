"""Cookie sessions, CSRF and shared abuse controls. No credentials reach JS."""
import hashlib
import hmac
import ipaddress
import logging
import math
import os
import secrets
import time
from urllib.parse import urlsplit

import jwt
from fastapi import HTTPException
from . import supabase_store as store

COOKIE = '__Host-wipro-session'
logger = logging.getLogger('wipro.security')
_local_sessions = {}  # Development-only Mongo compatibility; never used on Vercel.


def secret():
    value = os.getenv('JWT_SECRET', '')
    if len(value.encode()) < 32:
        raise HTTPException(503, 'Secure sessions have not been configured.')
    return value


def origins():
    values = os.getenv('CORS_ORIGINS', 'https://wipro-fire-safety-v2.vercel.app').split(',')
    if os.getenv('VERCEL_URL'):
        values.append('https://' + os.environ['VERCEL_URL'])
    if not os.getenv('VERCEL'):
        values += ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://testserver']
    return {v.rstrip('/') for v in values if urlsplit(v).scheme == 'https' or
            (not os.getenv('VERCEL') and urlsplit(v).hostname in {'localhost', '127.0.0.1'})}


def check_origin(request):
    if request.headers.get('origin') not in origins() or request.headers.get('sec-fetch-site') == 'cross-site':
        logger.warning('security_event=origin_denied')
        raise HTTPException(403, 'This request must come from the staff website.')


def csrf(cookie):
    return hmac.new(secret().encode(), ('csrf:' + cookie).encode(), hashlib.sha256).hexdigest()


def decode_cookie(request):
    cookie = request.cookies.get(COOKIE, '')
    try:
        payload = jwt.decode(cookie, secret(), algorithms=['HS256'],
                             audience='wipro-staff-web', options={'require': ['exp', 'iat', 'jti', 'sub']})
        if not isinstance(payload.get('upstream'), str) or not payload['upstream']:
            raise jwt.InvalidTokenError()
        return cookie, payload
    except jwt.InvalidTokenError:
        raise HTTPException(401, 'Your session has expired. Please sign in again.') from None


def check_csrf(request):
    check_origin(request)
    cookie, _ = decode_cookie(request)
    if not hmac.compare_digest(request.headers.get('x-csrf-token', ''), csrf(cookie)):
        logger.warning('security_event=csrf_denied')
        raise HTTPException(403, 'Session verification failed. Reload the page and try again.')


async def issue(response, token, user_id, expires):
    now = int(time.time())
    expires = min(int(expires), now + 3600)
    if expires <= now:
        raise HTTPException(401, 'Please sign in again.')
    jti = secrets.token_hex(32)
    digest = hashlib.sha256(jti.encode()).hexdigest()
    if store.enabled():
        await store.request('POST', '/rest/v1/rpc/security_session_create', privileged=True,
                            body={'p_hash': digest, 'p_user_id': user_id, 'p_expires': expires})
    else:
        _local_sessions[digest] = (user_id, expires)
    cookie = jwt.encode({'sub': user_id, 'upstream': token, 'jti': jti, 'iat': now,
                         'exp': expires, 'aud': 'wipro-staff-web'}, secret(), algorithm='HS256')
    response.set_cookie(COOKIE, cookie, max_age=expires - now, path='/', secure=True, httponly=True, samesite='strict')
    logger.warning('security_event=login_success')
    return {'user_id': user_id, 'csrf_token': csrf(cookie), 'expires_at': expires}


async def session(request):
    cookie, payload = decode_cookie(request)
    digest = hashlib.sha256(payload['jti'].encode()).hexdigest()
    if store.enabled():
        active = await store.request('POST', '/rest/v1/rpc/security_session_active', privileged=True,
                                     body={'p_hash': digest, 'p_user_id': payload['sub']})
    else:
        active = _local_sessions.get(digest) == (payload['sub'], payload['exp'])
    if active is not True:
        raise HTTPException(401, 'Please sign in again.')
    return cookie, payload


async def logout(request):
    _, payload = decode_cookie(request)
    digest = hashlib.sha256(payload['jti'].encode()).hexdigest()
    if store.enabled():
        await store.request('POST', '/rest/v1/rpc/security_session_revoke', privileged=True, body={'p_hash': digest})
    else:
        _local_sessions.pop(digest, None)
    logger.warning('security_event=logout')


def client_key(request):
    # Vercel overwrites X-Forwarded-For. Never trust it on a directly hosted server.
    address = request.headers.get('x-forwarded-for', '') if os.getenv('VERCEL') == '1' else ''
    address = address.strip()
    if not address:
        address = request.client.host if request.client else 'unknown'
    try:
        address = str(ipaddress.ip_address(address))
    except ValueError:
        address = 'unknown'
    return hmac.new(secret().encode(), ('rate:' + address).encode(), hashlib.sha256).hexdigest()


async def shared_limit(request, scope, limit, seconds):
    if not store.enabled():
        return  # Local guard in server.py covers the non-production Mongo path.
    result = await store.request('POST', '/rest/v1/rpc/security_rate_limit', privileged=True,
                                 body={'p_key': client_key(request), 'p_scope': scope,
                                       'p_limit': limit, 'p_seconds': seconds})
    if not isinstance(result, dict) or type(result.get('allowed')) is not bool:
        raise HTTPException(503, 'Request protection is temporarily unavailable.')
    if not result['allowed']:
        logger.warning('security_event=rate_limited scope=%s', scope)
        raise HTTPException(429, 'Too many requests. Please try again shortly.',
                            headers={'Retry-After': str(max(1, math.ceil(result.get('retry_after', seconds))))})

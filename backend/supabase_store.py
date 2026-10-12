"""Supabase transport. Staff operations always use the user's token and RLS.

The server secret is confined to validated enquiry insertion and readiness checks.
Never return upstream error bodies (they can contain customer data).
"""
import os
import uuid
import httpx
from fastapi import HTTPException


def enabled():
    provider = os.getenv('DATA_BACKEND', 'mongo').strip()
    if provider not in {'mongo', 'supabase'}:
        raise HTTPException(503, 'Invalid data backend configuration.')
    return provider == 'supabase'


def configuration():
    url = os.getenv('SUPABASE_URL', '').rstrip('/')
    key = os.getenv('SUPABASE_PUBLISHABLE_KEY', '').strip()
    secret = os.getenv('SUPABASE_SECRET_KEY', '').strip()
    if not url.startswith('https://') or not key or not secret:
        raise HTTPException(503, 'Supabase has not been configured yet.')
    return url, key, secret


async def request(method, path, *, token=None, privileged=False, body=None, params=None):
    url, key, secret = configuration()
    headers = {'apikey': secret if privileged else key, 'Prefer': 'return=representation'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    # Legacy service_role JWTs need Authorization; new sb_secret keys do not.
    elif privileged and not secret.startswith('sb_secret_'):
        headers['Authorization'] = f'Bearer {secret}'
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=False) as client:
            response = await client.request(method, url + path, headers=headers, json=body, params=params)
    except httpx.HTTPError:
        raise HTTPException(503, 'The database is temporarily unavailable. Please try again.') from None
    if path == "/auth/v1/token" and response.status_code in (400, 401, 422):
        raise HTTPException(401, "Invalid email or password.")
    if response.status_code == 429:
        raise HTTPException(429, "Too many requests. Please try again shortly.")
    if response.status_code in (401, 403):
        raise HTTPException(401 if token else 503, 'Your session is unavailable. Please sign in again.' if token else 'Database access is unavailable.')
    if response.status_code == 409:
        raise HTTPException(409, 'A record with this reference already exists.')
    if not response.is_success:
        raise HTTPException(503, 'The database is temporarily unavailable. Please try again.')
    try:
        return response.json() if response.content else None
    except ValueError:
        raise HTTPException(503, 'The database returned an invalid response.') from None


async def staff(token):
    user = await request('GET', '/auth/v1/user', token=token)
    if not isinstance(user, dict) or not user.get('id'):
        raise HTTPException(401, 'Please sign in again.')
    rows = await request('GET', '/rest/v1/staff_members', token=token,
                         params={'select': 'user_id', 'user_id': f'eq.{user["id"]}', 'limit': '1'})
    if not rows:
        raise HTTPException(403, 'This account is not approved for staff access.')
    return token


async def login(email, password):
    # Auth failures deliberately reveal neither account existence nor upstream details.
    result = await request('POST', '/auth/v1/token', params={'grant_type': 'password'}, body={'email': email, 'password': password})
    token = result.get('access_token') if isinstance(result, dict) else None
    if not token:
        raise HTTPException(401, 'Invalid email or password.')
    await staff(token)
    # No refresh token is stored in the browser. Expiry requires a fresh staff login.
    return token


def record_id(value):
    try:
        return str(uuid.UUID(value))
    except ValueError:
        raise HTTPException(404, 'Record not found.') from None


async def list_rows(table, token=None):
    return await request('GET', '/rest/v1/' + table, token=token,
                         params={'select': '*', 'order': 'created_at.desc', 'limit': '1000'})


async def insert(table, data, token=None):
    rows = await request('POST', '/rest/v1/' + table, token=token,
                         privileged=(table == 'contact_inquiries' and token is None), body=data)
    if not isinstance(rows, list) or len(rows) != 1 or rows[0].get('id') != data['id']:
        raise HTTPException(503, 'The database did not confirm saving this record.')
    return rows[0]


async def update(table, identifier, changes, token):
    rows = await request('PATCH', '/rest/v1/' + table, token=token,
                         params={'id': 'eq.' + record_id(identifier)}, body=changes)
    if not rows:
        raise HTTPException(404, 'Record not found.')
    return rows[0]


async def archive_product(identifier, token):
    await update('products', identifier, {'archived': True}, token)


async def health():
    staff_rows = await request('GET', '/rest/v1/staff_members', privileged=True, params={'select': 'user_id', 'limit': '1'})
    await request('GET', '/rest/v1/contact_inquiries', privileged=True, params={'select': 'id', 'limit': '0'})
    await request('GET', '/rest/v1/products', params={'select': 'id', 'limit': '0'})
    return bool(staff_rows)

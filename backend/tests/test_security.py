"""Attack-path regression tests use only a synthetic transport and synthetic users."""
import time
import jwt
from fastapi.testclient import TestClient
from backend import server, web_security
from backend.tests.test_supabase import api, auth, TOKEN


def test_cookie_attributes_no_tokens_in_json_and_legacy_bearer_denied(api):
    client, _, _ = api
    result = client.post('/api/admin/login', json={'email':'test@example.com','password':'password'})
    header = result.headers['set-cookie']
    assert '__Host-wipro-session=' in header
    for part in ['HttpOnly', 'Secure', 'SameSite=strict', 'Path=/', 'Max-Age=']:
        assert part in header
    assert 'Domain=' not in header
    assert TOKEN not in result.text and 'access_token' not in result.text
    assert 'refresh_token' not in result.text
    client.cookies.clear()
    assert client.get('/api/admin/products', headers={'Authorization':'Bearer '+TOKEN}).status_code == 401


def test_csrf_rejects_cross_origin_missing_token_and_token_from_another_session(api):
    client, _, _ = api
    headers=auth(client)
    assert client.post('/api/admin/logout', json={}).status_code==403
    assert client.post('/api/admin/logout', json={}, headers={**headers,'Origin':'https://attacker.invalid'}).status_code==403
    old_headers=headers
    headers=auth(client)
    assert client.post('/api/admin/logout',json={},headers=old_headers).status_code==403
    assert client.post('/api/admin/logout',json={},headers=headers).status_code==200


def test_logout_revokes_replayed_cookie_across_server_instances(api):
    client, _, _ = api
    headers=auth(client)
    cookie=client.cookies.get(web_security.COOKIE)
    assert client.get('/api/admin/session').status_code==200
    assert client.post('/api/admin/logout',json={},headers=headers).status_code==200
    # Replay a captured pre-logout cookie; backend shared state must reject it.
    with TestClient(server.app,base_url='https://testserver') as other:
        other.cookies.set(web_security.COOKIE,cookie)
        assert other.get('/api/contact').status_code==401


def test_tampered_expired_wrong_audience_and_revoked_sessions(api):
    client, _, _ = api
    auth(client)
    cookie=client.cookies.get(web_security.COOKIE)
    payload=jwt.decode(cookie,options={'verify_signature':False})
    for changed in [{**payload,'exp':int(time.time())-1}, {**payload,'aud':'other-app'}]:
        client.cookies.clear()
        client.cookies.set(web_security.COOKIE,jwt.encode(changed,web_security.secret(),algorithm='HS256'))
        assert client.get('/api/contact').status_code==401
    client.cookies.clear()
    client.cookies.set(web_security.COOKIE,cookie[:-8]+'tampered')
    assert client.get('/api/contact').status_code==401


def test_login_csrf_and_shared_rate_limits_fail_closed_before_upstream(api):
    client, calls, state=api
    assert client.post('/api/admin/login',json={'email':'test@example.com','password':'password'},headers={'Origin':'https://attacker.invalid'}).status_code==403
    assert calls==[]
    state['limited']=True
    result=client.post('/api/admin/login',json={'email':'test@example.com','password':'password'})
    assert result.status_code==429 and result.headers['retry-after']=='60'
    assert all('/rpc/security_rate_limit' in str(req.url) for req in calls)
    state['failure']=True
    result=client.post('/api/contact',json={'name':'Test','email':'test@example.com','phone':'9999999999','message':'test'})
    assert result.status_code==503 and 'SECRET' not in result.text


def test_production_docs_debug_and_upload_surface_disabled(api):
    client, _, _=api
    assert server.app.debug is False
    for path in ['/docs','/redoc','/openapi.json','/api/upload']:
        assert client.get(path).status_code==404
    assert client.post('/api/contact',files={'file':('evil.html',b'<script>evil()</script>','text/html')}).status_code==415


def test_client_ip_only_trusts_vercel_managed_forwarding(api, monkeypatch):
    from starlette.requests import Request
    request=Request({'type':'http','headers':[(b'x-forwarded-for',b'1.2.3.4')],'client':('8.8.8.8',123)})
    monkeypatch.delenv('VERCEL',raising=False)
    direct=web_security.client_key(request)
    monkeypatch.setenv('VERCEL','1')
    assert web_security.client_key(request)!=direct
    assert len(direct)==64 and '8.8.8.8' not in direct

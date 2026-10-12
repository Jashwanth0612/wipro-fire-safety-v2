"""Contract/security tests against a mock HTTP transport, never a live account."""
import json
import uuid
import httpx
import pytest
from fastapi.testclient import TestClient
from backend import server, supabase_store as store

USER = str(uuid.uuid4())
ITEM = str(uuid.uuid4())

@pytest.fixture
def api(monkeypatch):
    monkeypatch.setenv('DATA_BACKEND', 'supabase')
    monkeypatch.setenv('SUPABASE_URL', 'https://test.supabase.co')
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    monkeypatch.setenv('SUPABASE_SECRET_KEY', 'sb_secret_test')
    calls = []
    state = {'staff': True, 'failure': False, 'bad_login': False, 'missing': False}
    def handler(req):
        calls.append(req)
        if state['failure']:
            return httpx.Response(500, json={'error': 'SECRET AND CUSTOMER DATA'})
        if req.url.path == '/auth/v1/token':
            if state['bad_login']:
                return httpx.Response(400, json={'error': 'account information'})
            return httpx.Response(200, json={'access_token': 'staff-jwt', 'refresh_token': 'never-expose'})
        if req.url.path == '/auth/v1/user':
            if req.headers.get('authorization') != 'Bearer staff-jwt':
                return httpx.Response(401, json={'error': 'expired'})
            return httpx.Response(200, json={'id': USER})
        if req.url.path.endswith('staff_members'):
            return httpx.Response(200, json=[{'user_id': USER}] if state['staff'] else [])
        if req.method in ('POST', 'PATCH'):
            data = json.loads(req.content)
            return httpx.Response(200, json=[] if state['missing'] else [{'id': ITEM, **data}])
        return httpx.Response(200, json=[])
    original = httpx.AsyncClient
    monkeypatch.setattr(store.httpx, 'AsyncClient', lambda **kw: original(transport=httpx.MockTransport(handler), **kw))
    server._rate_windows.clear()
    with TestClient(server.app) as client:
        yield client, calls, state

AUTH = {'Authorization': 'Bearer staff-jwt'}

def test_contact_is_validated_and_only_insert_uses_server_secret(api):
    client, calls, _ = api
    body = {'name':'Test', 'email':'test@example.com', 'phone':'9999999999', 'message':'Test quote', 'service':'amc', 'products':[{'id':'catalog-1','title':'ABC','quantity':2}]}
    result = client.post('/api/contact', json=body)
    assert result.status_code == 201
    assert result.json()['products'][0]['quantity'] == 2
    assert calls[-1].headers['apikey'] == 'sb_secret_test'
    assert 'authorization' not in calls[-1].headers
    before = len(calls)
    assert client.post('/api/contact', json={**body, 'phone':'bad'}).status_code == 422
    assert len(calls) == before
    assert client.get('/api/contact').status_code == 401


def test_staff_token_used_for_reads_writes_and_soft_delete(api):
    client, calls, _ = api
    assert client.get('/api/contact', headers=AUTH).status_code == 200
    assert all(req.headers['apikey'] == 'sb_publishable_test' for req in calls)
    assert all(req.headers.get('authorization') == 'Bearer staff-jwt' for req in calls)
    result = client.delete('/api/products/' + ITEM, headers=AUTH)
    assert result.status_code == 200
    assert calls[-1].method == 'PATCH'
    assert json.loads(calls[-1].content) == {'archived': True}
    assert not any(req.method == 'DELETE' for req in calls)


def test_nonstaff_and_expired_tokens_denied(api):
    client, calls, state = api
    state['staff'] = False
    assert client.get('/api/contact', headers=AUTH).status_code == 403
    assert not any(req.url.path.endswith('contact_inquiries') for req in calls)
    assert client.get('/api/contact', headers={'Authorization':'Bearer expired'}).status_code == 401
    assert client.post('/api/admin/login', json={'email':'test@example.com','password':'password'}).status_code == 403


def test_login_no_refresh_token_and_invalid_credentials(api):
    client, calls, state = api
    result = client.post('/api/admin/login', json={'email':'test@example.com','password':'password'})
    assert result.status_code == 200
    assert result.json() == {'access_token':'staff-jwt', 'token_type':'bearer'}
    assert all(req.headers['apikey'] != 'sb_secret_test' for req in calls)
    state['bad_login'] = True
    assert client.post('/api/admin/login', json={'email':'test@example.com','password':'bad'}).status_code == 401


def test_upstream_failure_sanitized_and_no_false_receipt(api):
    client, _, state = api
    state['failure'] = True
    result = client.post('/api/contact', json={'name':'Test','email':'test@example.com','phone':'9999999999','message':'Test'})
    assert result.status_code == 503
    assert 'SECRET' not in result.text and 'id' not in result.json()
    assert client.get('/api/health').status_code == 503


def test_health_requires_staff_and_missing_config_fails_closed(api, monkeypatch):
    client, _, state = api
    assert client.get('/api/health').json()['provider'] == 'supabase'
    state['staff'] = False
    assert client.get('/api/health').status_code == 503
    monkeypatch.delenv('SUPABASE_SECRET_KEY')
    assert client.get('/api/products').status_code == 503


def test_public_catalogue_no_secret_and_missing_update(api):
    client, calls, state = api
    assert client.get('/api/products').status_code == 200
    assert calls[-1].headers['apikey'] == 'sb_publishable_test'
    assert 'authorization' not in calls[-1].headers
    state['missing'] = True
    assert client.patch('/api/products/' + ITEM, json={'stock':0}, headers=AUTH).status_code == 404
    assert client.patch('/api/products/not-a-uuid', json={'stock':0}, headers=AUTH).status_code == 404

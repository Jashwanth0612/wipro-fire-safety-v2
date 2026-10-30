"""Contract/security tests against a mock HTTP transport, never a live account."""
import json
import time
import jwt
import uuid
import httpx
import pytest
from fastapi.testclient import TestClient
from backend import server, supabase_store as store

USER = str(uuid.uuid4())
ITEM = str(uuid.uuid4())
TOKEN = jwt.encode({'sub':USER,'exp':int(time.time())+3600}, 'synthetic-supabase-test-token-key-12345', algorithm='HS256')

@pytest.fixture
def api(monkeypatch):
    monkeypatch.setenv('DATA_BACKEND', 'supabase')
    monkeypatch.setenv('SUPABASE_URL', 'https://test.supabase.co')
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    monkeypatch.setenv('SUPABASE_SECRET_KEY', 'sb_secret_test')
    monkeypatch.setenv('JWT_SECRET', 'synthetic-session-signing-test-secret-12345')
    calls = []
    state = {'staff': True, 'failure': False, 'bad_login': False, 'missing': False, 'revoked': False, 'limited': False}
    def handler(req):
        calls.append(req)
        if state['failure']:
            return httpx.Response(500, json={'error': 'SECRET AND CUSTOMER DATA'})
        if '/rpc/security_' in req.url.path:
            if req.url.path.endswith('security_rate_limit'):
                return httpx.Response(200,json={'allowed':not state['limited'],'retry_after':60})
            if req.url.path.endswith('security_session_revoke'):
                state['revoked']=True
            return httpx.Response(200,json=not state['revoked'])
        if req.url.path == '/auth/v1/token':
            if state['bad_login']:
                return httpx.Response(400, json={'error': 'account information'})
            return httpx.Response(200, json={'access_token': TOKEN, 'refresh_token': 'never-expose'})
        if req.url.path == '/auth/v1/user':
            if req.headers.get('authorization') != 'Bearer '+TOKEN:
                return httpx.Response(401, json={'error': 'expired'})
            return httpx.Response(200, json={'id': USER})
        if req.url.path.endswith('staff_members'):
            return httpx.Response(200, json=[{'user_id': USER}] if state['staff'] else [])
        if req.url.path == '/rest/v1/rpc/record_stock_movement':
            data = json.loads(req.content)
            return httpx.Response(200, json=[{'id':ITEM, 'request_id':data['p_request_id'], 'balance':14}])
        if req.method in ('POST', 'PATCH'):
            data = json.loads(req.content)
            return httpx.Response(200, json=[] if state['missing'] else [{'id': ITEM, **data}])
        return httpx.Response(200, json=[])
    original = httpx.AsyncClient
    monkeypatch.setattr(store.httpx, 'AsyncClient', lambda **kw: original(transport=httpx.MockTransport(handler), **kw))
    server._rate_windows.clear()
    with TestClient(server.app, base_url='https://testserver', headers={'Origin':'https://testserver'}) as client:
        yield client, calls, state

def auth(client):
    result=client.post('/api/admin/login', json={'email':'test@example.com','password':'password'})
    assert result.status_code==200,result.text
    return {'X-CSRF-Token': result.json()['csrf_token']}


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
    assert len(calls) == before + 1  # Invalid bodies still consume the shared abuse budget.
    assert calls[-1].url.path.endswith('security_rate_limit')
    assert client.get('/api/contact').status_code == 401


def test_staff_token_used_for_reads_writes_and_soft_delete(api):
    client, calls, _ = api
    assert client.get('/api/contact', headers=auth(client)).status_code == 200
    user_calls=[req for req in calls if '/rpc/security_' not in req.url.path]
    assert all(req.headers['apikey']=='sb_publishable_test' for req in user_calls)
    assert user_calls[-1].headers.get('authorization')=='Bearer '+TOKEN
    result = client.delete('/api/products/' + ITEM, headers=auth(client))
    assert result.status_code == 200
    assert calls[-1].method == 'PATCH'
    assert json.loads(calls[-1].content) == {'archived': True}
    assert not any(req.method == 'DELETE' for req in calls)


def test_nonstaff_and_expired_tokens_denied(api):
    client, calls, state = api
    auth(client)
    state['staff'] = False
    assert client.get('/api/contact').status_code == 403
    assert not any(req.url.path.endswith('contact_inquiries') for req in calls)
    client.cookies.clear()
    assert client.get('/api/contact', headers={'Authorization':'Bearer expired'}).status_code == 401
    assert client.post('/api/admin/login', json={'email':'test@example.com','password':'password'}).status_code == 403


def test_login_no_refresh_token_and_invalid_credentials(api):
    client, calls, state = api
    result = client.post('/api/admin/login', json={'email':'test@example.com','password':'password'})
    assert result.status_code == 200
    assert set(result.json())=={'user_id','csrf_token','expires_at'}
    assert TOKEN not in result.text and 'never-expose' not in result.text
    assert 'HttpOnly' in result.headers['set-cookie'] and 'Secure' in result.headers['set-cookie']
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
    assert client.patch('/api/products/' + ITEM, json={'stock':0}, headers=auth(client)).status_code == 409
    assert client.patch('/api/products/' + ITEM, json={'title':'Missing'}, headers=auth(client)).status_code == 404
    assert client.patch('/api/products/not-a-uuid', json={'title':'Missing'}, headers=auth(client)).status_code == 404


def test_inventory_uses_staff_rpc_and_validates_input(api):
    client, calls, state = api
    body = {'request_id': str(uuid.uuid4()), 'product_id': ITEM, 'kind':'receipt', 'quantity':4, 'reference':'TEST-DELIVERY', 'expected_stock':10}
    assert client.post('/api/inventory/movements', json=body).status_code == 401
    assert client.post('/api/inventory/movements', json=body, headers=auth(client)).status_code == 201
    req = calls[-1]
    assert req.url.path == '/rest/v1/rpc/record_stock_movement'
    assert req.headers['authorization'] == 'Bearer '+TOKEN
    assert req.headers['apikey'] == 'sb_publishable_test'
    assert json.loads(req.content)['p_quantity'] == 4
    for quantity in [0, -1, 1.5, True, 1000001]:
        assert client.post('/api/inventory/movements', json={**body,'quantity':quantity}, headers=auth(client)).status_code == 422
    assert client.post('/api/inventory/movements', json={**body,'reference':'   '}, headers=auth(client)).status_code == 422
    headers=auth(client)
    state['staff'] = False
    assert client.get('/api/inventory/movements').status_code == 403
    assert client.post('/api/inventory/movements',json=body,headers=headers).status_code == 403


def test_inventory_history_is_private_and_paginated(api):
    client, calls, _ = api
    assert client.get('/api/inventory/movements').status_code == 401
    assert client.get('/api/inventory/movements?offset=50&product_id='+ITEM,headers=auth(client)).status_code == 200
    assert calls[-1].url.params['limit'] == '50'
    assert calls[-1].url.params['offset'] == '50'
    assert calls[-1].url.params['product_id'] == 'eq.'+ITEM
    assert client.get('/api/inventory/movements?offset=-1',headers=auth(client)).status_code == 422

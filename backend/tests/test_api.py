"""API contract tests use an isolated in-memory fake; no customer DB is touched."""
from copy import deepcopy
from types import SimpleNamespace
from datetime import datetime, timedelta, timezone
import importlib.util
from pathlib import Path
import jwt
import pytest
from fastapi.testclient import TestClient
from pymongo.errors import ServerSelectionTimeoutError

spec = importlib.util.spec_from_file_location('wipro_server', Path(__file__).parents[1] / 'server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

class Cursor:
    def __init__(self, rows): self.rows = rows
    def sort(self, *args): return self
    async def to_list(self, count): return deepcopy(self.rows[:count])

class Collection:
    def __init__(self): self.rows = []
    async def insert_one(self, data): self.rows.append(deepcopy(data))
    def find(self, *args): return Cursor(self.rows)
    async def update_one(self, query, update):
        for row in self.rows:
            if row['id'] == query['id']:
                changed = any(row.get(key) != value for key, value in update['$set'].items())
                row.update(update['$set'])
                return SimpleNamespace(matched_count=1, modified_count=int(changed))
        return SimpleNamespace(matched_count=0, modified_count=0)
    async def find_one_and_update(self, query, update, **kwargs):
        result = await self.update_one(query, update)
        return deepcopy(next(row for row in self.rows if row['id'] == query['id'])) if result.matched_count else None
    async def delete_one(self, query):
        before = len(self.rows)
        self.rows = [row for row in self.rows if row['id'] != query['id']]
        return SimpleNamespace(deleted_count=before - len(self.rows))

@pytest.fixture
def api(monkeypatch):
    monkeypatch.setenv('ADMIN_EMAIL', 'admin@example.com')
    monkeypatch.setenv('ADMIN_PASSWORD', 'test-only-password')
    monkeypatch.setenv('JWT_SECRET', 'isolated-test-signing-key-never-use-in-production-123')
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    monkeypatch.delenv('MONGO_URI', raising=False)
    database = SimpleNamespace(contact_inquiries=Collection(), products=Collection())
    server.app.dependency_overrides[server.get_database] = lambda: database
    server._rate_windows.clear()
    with TestClient(server.app) as client:
        yield client, database
    server.app.dependency_overrides.clear()


def auth(client):
    result = client.post('/api/admin/login', json={'email':'admin@example.com','password':'test-only-password'})
    assert result.status_code == 200
    return {'Authorization': 'Bearer ' + result.json()['access_token']}


def test_enquiry_persists_service_quote_and_can_be_read_by_admin(api):
    client, db = api
    payload = {'name':' Test Customer ', 'email':'test@example.com', 'phone':'+91 99999 99999', 'message':'Quote for our office', 'service':'amc', 'products':[{'id':'api:db-123','title':'Extinguisher','quantity':2,'models':['ABC4']} ]}
    saved = client.post('/api/contact', json=payload)
    assert saved.status_code == 201, saved.text
    assert db.contact_inquiries.rows[0]['service'] == 'amc'
    records = client.get('/api/contact', headers=auth(client)).json()
    assert records[0]['id'] == saved.json()['id']
    assert records[0]['products'][0]['quantity'] == 2
    assert client.get('/api/contact').status_code == 401


def test_repeated_status_update_is_successful_and_invalid_status_rejected(api):
    client, db = api
    db.contact_inquiries.rows.append({'id':'test-record','status':'pending'})
    headers = auth(client)
    for _ in range(2):
        assert client.patch('/api/contact/test-record/status', json={'status':'contacted'},headers=headers).status_code == 200
    assert client.patch('/api/contact/test-record/status', json={'status':'made-up'}, headers=headers).status_code == 422
    assert client.patch('/api/contact/missing/status', json={'status':'contacted'}, headers=headers).status_code == 404


def test_stock_persists_and_survives_refetch_without_invented_quantities(api):
    client, db = api
    headers = auth(client)
    saved = client.post('/api/products', json={'title':'ABC Extinguisher','description':'Fire equipment','category':'Fire Extinguishers','slug':'catalog-1'}, headers=headers)
    assert saved.status_code == 201
    assert saved.json()['stock'] is None
    record_id = saved.json()['id']
    updated = client.patch('/api/products/'+record_id, json={'stock':0}, headers=headers)
    assert updated.status_code == 200
    assert client.get('/api/products').json()[0]['stock'] == 0
    assert client.patch('/api/products/'+record_id, json={'stock':-1},headers=headers).status_code == 422
    assert client.patch('/api/products/'+record_id, json={'stock':2}).status_code == 401
    assert client.delete('/api/products/'+record_id, headers=headers).status_code == 200
    assert client.get('/api/products').json() == []


def test_invalid_expired_and_wrong_subject_tokens_return_401(api, monkeypatch):
    client, _ = api
    secret = 'isolated-test-signing-key-never-use-in-production-123'
    for token in ['invalid', jwt.encode({'sub':'other@example.com','exp':datetime.now(timezone.utc)+timedelta(hours=1)},secret,algorithm='HS256'), jwt.encode({'sub':'admin@example.com','exp':datetime.now(timezone.utc)-timedelta(hours=1)},secret,algorithm='HS256')]:
        assert client.get('/api/contact', headers={'Authorization':'Bearer '+token}).status_code == 401


def test_missing_config_is_explicit_and_optional_ai_does_not_break_startup(api):
    client, _ = api
    health = client.get('/api/health')
    assert health.status_code == 503
    assert health.json()['database'] == 'unconfigured'
    reply = client.post('/api/chat',json={'message':'What is the price?'})
    assert reply.status_code == 200
    assert reply.json()['mode'] == 'company-information'
    assert 'confirm pricing' in reply.json()['response']
    server.app.dependency_overrides.clear()
    assert client.post('/api/contact',json={'name':'A','email':'test@example.com','phone':'9999999999','message':'Hello'}).status_code == 503


def test_validation_and_abuse_limits(api):
    client, _ = api
    assert client.post('/api/chat',json={'message':'x'*2001}).status_code == 422
    assert client.post('/api/chat',content='x'*66000,headers={'Content-Type':'application/json'}).status_code == 413
    payload={'name':'A','email':'test@example.com','phone':'9999999999','message':'Hello'}
    assert client.post('/api/contact',json={**payload,'phone':'invalid phone'}).status_code == 422
    for _ in range(5): assert client.post('/api/contact',json=payload).status_code == 201
    limited = client.post('/api/contact',json=payload)
    assert limited.status_code == 429
    assert 'retry-after' in limited.headers


def test_database_failure_never_returns_a_receipt(api):
    client, database = api
    async def fail(_): raise ServerSelectionTimeoutError('test failure')
    database.contact_inquiries.insert_one = fail
    response = client.post('/api/contact',json={'name':'A','email':'test@example.com','phone':'9999999999','message':'Hello'})
    assert response.status_code == 503
    assert 'id' not in response.json()

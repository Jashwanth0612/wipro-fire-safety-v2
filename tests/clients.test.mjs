import test from 'node:test'
import assert from 'node:assert/strict'
import { CLIENTS } from '../src/data/clients.js'
import { browseClients, CLIENT_PAGE_SIZE } from '../src/lib/clients.js'

test('every existing installation is reachable exactly once across pages', () => {
  const before = CLIENTS.map(client => client.id)
  const first = browseClients(CLIENTS)
  const ids = Array.from({ length: first.pages }, (_, i) => browseClients(CLIENTS, { page: i + 1 }).items).flat().map(client => client.id)
  assert.equal(first.items.length, CLIENT_PAGE_SIZE)
  assert.equal(ids.length, CLIENTS.length)
  assert.equal(new Set(ids).size, CLIENTS.length)
  assert.deepEqual([...ids].sort(), [...before].sort())
  assert.deepEqual(CLIENTS.map(client => client.id), before)
})
test('combined filters, case-insensitive search and empty results behave correctly', () => {
  const result = browseClients(CLIENTS, { city: 'hyderabad', status: 'Running', industry: 'Pharma', search: ' GRAVITY ' })
  assert.equal(result.total, 1)
  assert.equal(result.items[0].name, 'Gravity Pharmaceutical Pvt Ltd')
  const empty = browseClients(CLIENTS, { search: 'no-company-938274', page: 8 })
  assert.equal(empty.total, 0)
  assert.equal(empty.start, 0)
  assert.equal(empty.end, 0)
  assert.equal(empty.page, 1)
})
test('out-of-range pages clamp after results narrow, including the final partial page', () => {
  const last = browseClients(CLIENTS, { page: 999 })
  assert.equal(last.end, CLIENTS.length)
  assert.ok(last.items.length > 0 && last.items.length <= CLIENT_PAGE_SIZE)
  const narrowed = browseClients(CLIENTS, { city: 'vijayawada', page: 10 })
  assert.equal(narrowed.page, 1)
  assert.equal(narrowed.items.length, 1)
})

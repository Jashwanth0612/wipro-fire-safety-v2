import test from 'node:test'
import assert from 'node:assert/strict'
import { loadPendingStock, recordRecoverableMovement } from '../src/lib/stock-recovery.mjs'
const user = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'
const token = (sub = user, exp = 1) => `header.${Buffer.from(JSON.stringify({sub, exp})).toString('base64url')}.signature`
const body = { product_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', kind: 'receipt', quantity: 4, reference: 'TEST-ONLY', note: 'Synthetic test fixture', expected_stock: 10, request_id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc' }
function fixture() {
 const values = new Map()
 const storage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) }
 return {values, storage, getStorage: () => storage}
}
const confirmed = payload => ({id:'movement-id', request_id:payload.request_id, balance:14})

test('lost response then page reload and renewed login replays the exact request only once', async () => {
 const f = fixture(), committed = new Map()
 let balance = 10, attempts = 0
 const request = async payload => {
  attempts++
  if (!committed.has(payload.request_id)) { balance += payload.quantity; committed.set(payload.request_id, confirmed(payload)) }
  if (attempts === 1) throw new TypeError('Network response lost after commit')
  return committed.get(payload.request_id)
 }
 await assert.rejects(recordRecoverableMovement({token:token(),body,request,...f}))
 const recovered = loadPendingStock(token(user,2),f.getStorage)
 assert.deepEqual(recovered,body)
 await recordRecoverableMovement({token:token(user,2),body:recovered,request,...f})
 assert.equal(attempts,2); assert.equal(balance,14); assert.equal(committed.size,1)
 assert.equal(loadPendingStock(token(),f.getStorage),null)
})

test('auth expiry, rate limits, server failure and malformed success keep recovery data', async () => {
 for (const status of [401,403,429,500,undefined]) {
  const f=fixture()
  await assert.rejects(recordRecoverableMovement({token:token(),body,request:async()=>{throw Object.assign(new Error('failed'),{status})},...f}))
  assert.deepEqual(loadPendingStock(token(),f.getStorage),body)
 }
 for (const result of [null,{}, {id:'id',request_id:'different-id'}, {id:'id',request_id:body.request_id}, {id:'id',request_id:body.request_id,balance:-1}]) {
  const f=fixture()
  await assert.rejects(recordRecoverableMovement({token:token(),body,request:async()=>result,...f}))
  assert.deepEqual(loadPendingStock(token(),f.getStorage),body)
 }
})

test('definite rejection clears the outbox so staff can correct the entry', async () => {
 for (const status of [400,404,409,422]) {
  const f=fixture()
  await assert.rejects(recordRecoverableMovement({token:token(),body,request:async()=>{throw Object.assign(new Error('rejected'),{status})},...f}))
  assert.equal(loadPendingStock(token(),f.getStorage),null)
 }
})

test('storage failure, invalid session or malformed payload prevents any network mutation', async () => {
 let writes=0
 const request=async()=>{writes++; return confirmed(body)}
 const f=fixture()
 await assert.rejects(recordRecoverableMovement({token:token(),body,request,getStorage:()=>{throw new Error('blocked')}}))
 await assert.rejects(recordRecoverableMovement({token:'invalid',body,request,...f}))
 await assert.rejects(recordRecoverableMovement({token:token(),body:{...body,quantity:1.5},request,...f}))
 await assert.rejects(recordRecoverableMovement({token:token(),body:{...body,secret:'must never persist'},request,...f}))
 assert.equal(writes,0)
})

test('outbox contains no token and cannot overwrite an unresolved request', async () => {
 const f=fixture()
 await assert.rejects(recordRecoverableMovement({token:token(),body,request:async()=>{throw new Error('offline')},...f}))
 assert.equal([...f.values.values()].join('').includes(token()),false)
 assert.equal(loadPendingStock(token('dddddddd-dddd-4ddd-dddd-dddddddddddd'),f.getStorage),null)
 let writes=0
 await assert.rejects(recordRecoverableMovement({token:token(),body:{...body,quantity:9},request:async()=>{writes++},...f}),/earlier stock entry/)
 assert.equal(writes,0); assert.deepEqual(loadPendingStock(token(),f.getStorage),body)
 const key=[...f.values.keys()][0]
 f.values.set(key,'broken JSON')
 assert.throws(()=>loadPendingStock(token(),f.getStorage),/recovery is unavailable/)
 await assert.rejects(recordRecoverableMovement({token:token(),body,request:async()=>{writes++},...f}))
 assert.equal(writes,0)
})

test('failed removal keeps the same confirmed request available instead of permitting a duplicate', async () => {
 const f=fixture()
 f.storage.removeItem=()=>{}
 await assert.rejects(recordRecoverableMovement({token:token(),body,request:async()=>confirmed(body),...f}),/recovery is unavailable/)
 assert.deepEqual(loadPendingStock(token(),f.getStorage),body)
})

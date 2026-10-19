import test from 'node:test'
import assert from 'node:assert/strict'
import { inventoryCategories, stockPreview } from '../src/lib/inventory.mjs'
test('every stored category remains reachable without renaming catalogue records', () => {
 const items = [{category:'Safety Equipment'}, {category:'Safety Equipment'}, {category:'Custom supplies'}, {category:null}]
 const categories = inventoryCategories(items, ['PPE Equipment'])
 assert.deepEqual(categories, ['PPE Equipment', 'Safety Equipment', 'Custom supplies'])
 assert.equal(items[0].category, 'Safety Equipment')
})
test('receipts and dispatches predict balances without changing source stock', () => {
 assert.equal(stockPreview(12,'receipt','5').balance,17)
 assert.equal(stockPreview(12,'dispatch','5').balance,7)
 assert.equal(stockPreview(12,'dispatch','12').balance,0)
 assert.ok(stockPreview(12,'dispatch','13').error)
})
test('unknown is not zero; count is required before movements', () => {
 assert.ok(stockPreview(null,'receipt','5').error)
 assert.equal(stockPreview(null,'count','0').balance,0)
 assert.equal(stockPreview(12,'count','4').balance,4)
})
test('invalid quantities and excessive balances are blocked', () => {
 for(const value of ['', '-1','1.5','1000001','abc']) assert.ok(stockPreview(10,'receipt',value).error)
 assert.ok(stockPreview(1000000,'receipt','1').error)
 assert.ok(stockPreview(1,'receipt','0').error)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { inventoryCategories, inventoryPage, stockPreview } from '../src/lib/inventory.mjs'
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

test('inventory pages cover all products exactly once and clamp after removal', () => {
 const items = Array.from({length:40},(_,i)=>({id:String(i),title:`Product ${i}`,category:'Safety Equipment',stock:i,minStock:5}))
 const ids = []
 for(let page=1;page<=5;page++) ids.push(...inventoryPage(items,{page}).items.map(p=>p.id))
 assert.equal(new Set(ids).size,40)
 assert.equal(ids.length,40)
 assert.equal(inventoryPage(items.slice(0,8),{page:5}).page,1)
 assert.equal(inventoryPage(items,{pageSize:16,page:3}).items.length,8)
})
test('inventory search and stock filters run before pagination without mutating data', () => {
 const items = [{id:'1',title:'CO₂ Extinguisher',category:'Fire',stock:null}, {id:'2',title:'Gloves',category:'Safety',stock:0,minStock:5}, {id:'3',title:'Gloves',category:'Safety',stock:20,minStock:5}]
 assert.equal(inventoryPage(items,{search:' co2 '}).items[0].id,'1')
 assert.deepEqual(inventoryPage(items,{category:'Safety',stock:'low',page:9}).items.map(i=>i.id),['2'])
 assert.deepEqual(inventoryPage(items,{stock:'unknown'}).items.map(i=>i.id),['1'])
 assert.deepEqual(inventoryPage(items,{stock:'healthy'}).items.map(i=>i.id),['3'])
 const empty = inventoryPage(items,{search:'absent',page:3})
 assert.equal(empty.total,0); assert.equal(empty.start,0); assert.equal(empty.end,0); assert.equal(empty.page,1)
 assert.equal(items.length,3)
})

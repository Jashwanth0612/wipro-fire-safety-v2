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

test('category summaries distinguish unknown stock, real zero and partial counts', async () => {
 const { inventorySummary } = await import('../src/lib/inventory.mjs')
 const items = [{category:'Unknown',stock:null},{category:'Zero',stock:0},{category:'Partial',stock:3},{category:'Partial',stock:null}]
 const groups=inventorySummary(items)
 assert.deepEqual(groups.map(g=>[g.category,g.recorded,g.unknown,g.total]),[['Unknown',0,1,null],['Zero',1,0,0],['Partial',1,1,3]])
 assert.equal(items[0].stock,null)
 assert.deepEqual(inventorySummary([]),[])
})
test('summary separates units and accepts category names that collide with object prototypes', async () => {
 const { inventorySummary } = await import('../src/lib/inventory.mjs')
 const groups=inventorySummary([{category:'constructor',unit:'pcs',stock:2},{category:'constructor',unit:'kg',stock:7},{category:'__proto__',stock:5},{category:'constructor',unit:'pcs',stock:3}])
 assert.deepEqual(groups.map(g=>[g.category,g.unit,g.products,g.total]),[['constructor','pcs',2,5],['constructor','kg',1,7],['__proto__','pcs',1,5]])
})
test('invalid counts are not silently included in report totals', async () => {
 const { inventorySummary } = await import('../src/lib/inventory.mjs')
 const [group]=inventorySummary([null,undefined,-1,1.5,NaN,'4'].map(stock=>({category:'Safety',stock})))
 assert.equal(group.total,null); assert.equal(group.unknown,6); assert.equal(group.recorded,0)
})

test('dashboard unit totals combine categories without combining unlike units', async () => {
 const { inventoryUnitSummary } = await import('../src/lib/inventory.mjs')
 const items = [{category:'Fire',unit:'pcs',stock:3},{category:'Safety',unit:'pcs',stock:4},{category:'Safety',unit:'kg',stock:6},{category:'Fire',unit:'pcs',stock:null}]
 assert.deepEqual(inventoryUnitSummary(items),[
  {unit:'pcs',products:3,recorded:2,unknown:1,total:7},
  {unit:'kg',products:1,recorded:1,unknown:0,total:6}
 ])
 assert.equal(items[3].stock,null)
})
test('dashboard keeps uncounted units distinct from a counted zero', async () => {
 const { inventoryUnitSummary } = await import('../src/lib/inventory.mjs')
 assert.deepEqual(inventoryUnitSummary([{unit:'pcs',stock:null},{unit:'kg',stock:0}]).map(g=>[g.unit,g.total,g.recorded]),[['pcs',null,0],['kg',0,1]])
 assert.deepEqual(inventoryUnitSummary([]),[])
})

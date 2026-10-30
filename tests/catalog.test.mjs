import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS, CATEGORIES } from '../src/data/products.js'
import { browseProducts, filterProducts, quoteMessage } from '../src/lib/catalog.js'
import { submitInquiry } from '../src/lib/api.js'
import { existsSync } from 'node:fs'

test('every original category and product is available with a local image', () => {
  assert.equal(PRODUCTS.length,40)
  assert.equal(new Set(PRODUCTS.map(p => p.id)).size,40)
  for (const category of CATEGORIES) assert.ok(PRODUCTS.some(p => p.category === category.id))
  for (const product of PRODUCTS) assert.ok(existsSync(`public${product.img}`), product.img)
})
test('search supports model numbers, descriptions, and CO2/CO₂', () => {
  assert.ok(filterProducts(PRODUCTS,'all','VFPA4').some(p => p.id === 1))
  assert.ok(filterProducts(PRODUCTS,'all','server rooms').some(p => p.id === 3))
  assert.deepEqual(filterProducts(PRODUCTS,'all','co2').map(p=>p.id),filterProducts(PRODUCTS,'all','CO₂').map(p=>p.id))
})
test('category, empty state, and sort compose without mutating the catalogue', () => {
  assert.equal(filterProducts(PRODUCTS,'extinguishers','').length,12)
  assert.equal(filterProducts(PRODUCTS,'road','server rooms').length,0)
  assert.equal(filterProducts(PRODUCTS,'all','no-match-9382').length,0)
  const ids=PRODUCTS.map(p=>p.id)
  const sorted=filterProducts(PRODUCTS,'all','','name')
  assert.ok(sorted.every((p,i)=>i===0||sorted[i-1].title.localeCompare(p.title)<=0))
  assert.deepEqual(PRODUCTS.map(p=>p.id),ids)
})
test('quote preserves the visitor message and includes exact product variant and quantity', () => {
  const message=quoteMessage('  Please quote for our office.  ',[{...PRODUCTS[0],quantity:3},{...PRODUCTS[1],quantity:2}])
  assert.ok(message.startsWith('Please quote for our office.\n\n'))
  assert.match(message,/Stored Pressure Type \| Quantity: 3/)
  assert.match(message,/Cartridge Type \| Quantity: 2/)
  assert.match(message,/VFPA4/)
  assert.equal(quoteMessage(' Hello ',[]),'Hello')
})
test('paged public catalogue reaches every product exactly once in alphabetical order', () => {
  const originalIds = PRODUCTS.map(product => product.id)
  const first = browseProducts(PRODUCTS)
  assert.equal(first.items.length, 9)
  assert.equal(first.pages, 5)
  const seen = Array.from({ length: first.pages }, (_, index) => browseProducts(PRODUCTS, { page: index + 1 })).flatMap(result => result.items)
  assert.equal(new Set(seen.map(product => product.id)).size, PRODUCTS.length)
  assert.deepEqual(seen.map(product => product.id).sort((a, b) => a - b), [...originalIds].sort((a, b) => a - b))
  assert.ok(seen.every((product, index) => index === 0 || seen[index - 1].title.localeCompare(product.title) <= 0))
  assert.deepEqual(PRODUCTS.map(product => product.id), originalIds)
})
test('product search and categories operate on the full range and clamp stale pages', () => {
  const category = browseProducts(PRODUCTS, { category: 'extinguishers', page: 5 })
  assert.deepEqual([category.total, category.page, category.start, category.end], [12, 2, 10, 12])
  assert.ok(category.items.every(product => product.category === 'extinguishers'))
  const model = browseProducts(PRODUCTS, { query: 'VFPA4', page: 5 })
  assert.equal(model.page, 1)
  assert.ok(model.items.some(product => product.id === 1))
  const empty = browseProducts(PRODUCTS, { query: 'no-match-9382', page: 5 })
  assert.deepEqual([empty.total, empty.page, empty.start, empty.end], [0, 1, 0, 0])
  assert.deepEqual(browseProducts(PRODUCTS, { sort: 'featured' }).items, PRODUCTS.slice(0, 9))
})
test('enquiry sends the existing backend contract with quote details', async () => {
  const original=globalThis.fetch
  let request
  globalThis.fetch=async(url,options)=>{request={url,options};return new Response('{"id":"test-receipt"}',{status:200,headers:{'content-type':'application/json'}})}
  try {
    await submitInquiry({name:' Test ',email:'test@example.com',phone:'9999999999',service:'amc',message:'Quotation only'},[{...PRODUCTS[0],quantity:4}])
    assert.ok(request.url.endsWith('/api/contact'))
    assert.equal(request.options.method,'POST')
    const body=JSON.parse(request.options.body)
    assert.deepEqual(Object.keys(body).sort(),['email','message','name','phone','products','service'])
    assert.equal(body.name,'Test')
    assert.match(body.message,/Quantity: 4/)
  } finally {globalThis.fetch=original}
})
test('non-success responses and aborted requests never report success', async () => {
  const original=globalThis.fetch
  const form={name:'Test',email:'test@example.com',phone:'9999999999',service:'other',message:'Test'}
  try {
    globalThis.fetch=async()=>new Response('{}',{status:503})
    await assert.rejects(submitInquiry(form,[]),/could not confirm/)
    globalThis.fetch=async()=>{throw new DOMException('Aborted','AbortError')}
    await assert.rejects(submitInquiry(form,[]),{name:'AbortError'})
  } finally {globalThis.fetch=original}
})

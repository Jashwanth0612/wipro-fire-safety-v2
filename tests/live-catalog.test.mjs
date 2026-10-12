import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from '../src/data/products.js'
import { mergeCatalogue, safeProductImage } from '../src/lib/live-catalog.js'
import { filterProducts, quoteMessage } from '../src/lib/catalog.js'
test('an empty inventory preserves all 40 original products', () => {
  assert.deepEqual(mergeCatalogue(PRODUCTS, []), PRODUCTS)
  assert.throws(() => mergeCatalogue(PRODUCTS, {}), /Invalid/)
})
test('explicit linked records enrich an original without losing specs or images', () => {
  const items = mergeCatalogue(PRODUCTS, [{id:'db1',slug:'catalog-1',title:'Updated extinguisher',description:'Latest description',category:'Fire Extinguishers',stock:0}])
  assert.equal(items.length,40)
  assert.equal(items[0].id,1)
  assert.equal(items[0].title,'Updated extinguisher')
  assert.equal(items[0].stock,0)
  assert.deepEqual(items[0].models,PRODUCTS[0].models)
  assert.equal(PRODUCTS[0].title,'ABC Dry Powder Extinguisher')
})
test('new products remain searchable and quotable without invented specs', () => {
  const items = mergeCatalogue(PRODUCTS, [{id:'db2',title:'New equipment',description:'Site-specific equipment',category:'Accessories',image_url:'javascript:alert(1)'}])
  const added = items.at(-1)
  assert.equal(items.length,41)
  assert.equal(added.id,'api:db2')
  assert.equal(added.stock,null)
  assert.equal(added.img,'')
  assert.equal(filterProducts(items,'other','site-specific').length,1)
  assert.match(quoteMessage('Quote',[{...added,quantity:2}]), /Quantity: 2/)
  assert.equal(safeProductImage('//untrusted.example/img'), '')
})

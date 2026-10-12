// API products extend the original catalogue. Only an explicit catalogue link
// may update an original item; an empty database never removes the brochure range.
const categoryIds = new Map([
  ['Fire Extinguishers', 'extinguishers'], ['Fire Alarm Systems', 'alarm'],
  ['Hydrant Systems', 'hydrant'], ['PPE Equipment', 'safety'],
  ['Exit Systems', 'safety'], ['Safety Equipment', 'safety'], ['Road Safety', 'road'],
])
const knownCategories = new Set(['extinguishers', 'alarm', 'hydrant', 'safety', 'road'])
export function safeProductImage(value) {
  if (typeof value !== 'string') return ''
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try { return new URL(value).protocol === 'https:' ? value : '' } catch { return '' }
}
export function mergeCatalogue(original, records) {
  if (!Array.isArray(records)) throw new Error('Invalid product catalogue response')
  const products = original.map(product => ({ ...product }))
  const seen = new Set()
  for (const record of records) {
    if (!record || !record.id || typeof record.title !== 'string' || !record.title.trim() || seen.has(record.id)) continue
    seen.add(record.id)
    const originalId = /^catalog-(\d+)$/.exec(record.slug || '')?.[1]
    const index = originalId ? products.findIndex(product => product.id === Number(originalId)) : -1
    const category = categoryIds.get(record.category) || (knownCategories.has(record.category) ? record.category : 'other')
    const base = index >= 0 ? products[index] : {
      id: `api:${record.id}`, subtitle: '', models: [], features: [], fireClass: [],
      isi: '', color: '#b74934', img: '',
    }
    const product = {
      ...base, apiId: record.id, title: record.title.trim(),
      desc: record.description || base.desc || '',
      category: index >= 0 && category === 'other' ? base.category : category,
      img: safeProductImage(record.image_url) || base.img,
      stock: Number.isInteger(record.stock) && record.stock >= 0 ? record.stock : null,
      unit: record.unit || 'pcs',
    }
    if (index >= 0) products[index] = product
    else products.push(product)
  }
  return products
}

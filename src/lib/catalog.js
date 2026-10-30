export function normalizeSearch(value) {
  return String(value).normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '')
}
export function filterProducts(products, category, query, sort = 'featured') {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean)
  const result = products.filter(product => {
    const text = normalizeSearch([product.title, product.subtitle, product.desc, ...product.models, ...product.features].join(' '))
    return (category === 'all' || product.category === category) && terms.every(term => text.includes(term))
  })
  return sort === 'name' ? result.sort((a, b) => a.title.localeCompare(b.title)) : result
}
export const PRODUCT_PAGE_SIZE = 9

export function browseProducts(products, { category = 'all', query = '', sort = 'name', page = 1 } = {}) {
  const filtered = filterProducts(products, category, query, sort)
  const pages = Math.max(1, Math.ceil(filtered.length / PRODUCT_PAGE_SIZE))
  const current = Math.max(1, Math.min(pages, Number.isFinite(page) ? Math.floor(page) : 1))
  const offset = (current - 1) * PRODUCT_PAGE_SIZE
  return { items: filtered.slice(offset, offset + PRODUCT_PAGE_SIZE), total: filtered.length, pages, page: current, start: filtered.length ? offset + 1 : 0, end: Math.min(offset + PRODUCT_PAGE_SIZE, filtered.length) }
}
export function quoteMessage(message, products) {
  if (!products.length) return message.trim()
  return `${message.trim()}\n\nRequested products:\n${products.map(product => `• ${product.title} — ${product.subtitle} | Quantity: ${product.quantity} | Models: ${product.models.join(', ')}`).join('\n')}`
}

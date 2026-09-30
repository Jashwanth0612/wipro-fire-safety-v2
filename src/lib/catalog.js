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
export function quoteMessage(message, products) {
  if (!products.length) return message.trim()
  return `${message.trim()}\n\nRequested products:\n${products.map(product => `• ${product.title} — ${product.subtitle} | Quantity: ${product.quantity} | Models: ${product.models.join(', ')}`).join('\n')}`
}

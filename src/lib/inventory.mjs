export function inventoryCategories(items, defaults = []) {
  return [...new Set([...defaults, ...items.map(item => item.category)]
    .filter(category => typeof category === 'string' && category.trim()))]
}

export function inventoryPage(items, { search = '', category = '', stock = 'all', page = 1, pageSize = 8 } = {}) {
  const query = search.trim().toLowerCase().replaceAll('₂', '2')
  const filtered = items.filter(item => (!category || item.category === category)
    && `${item.title} ${item.slug || ''} ${item.description || ''}`.toLowerCase().replaceAll('₂', '2').includes(query)
    && (stock === 'all' || (stock === 'unknown' ? item.stock == null : stock === 'healthy'
      ? item.stock != null && item.stock > (item.minStock ?? 5)
      : item.stock != null && item.stock <= (item.minStock ?? 5))))
  const size = [8, 16, 24].includes(pageSize) ? pageSize : 8
  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const current = Math.max(1, Math.min(Number.isInteger(page) ? page : 1, pages))
  const offset = (current - 1) * size
  return { items: filtered.slice(offset, offset + size), total: filtered.length, page: current, pages,
    start: filtered.length ? offset + 1 : 0, end: Math.min(offset + size, filtered.length) }
}

export function stockPreview(stock, kind, value) {
  const quantity = Number(value)
  if (value === '' || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000 || (kind !== 'count' && quantity === 0)) return { error: 'Enter a valid whole-number quantity.' }
  if (!['receipt', 'dispatch', 'count'].includes(kind)) return { error: 'Choose a stock action.' }
  if (kind !== 'count' && stock == null) return { error: 'Record an opening physical count first.' }
  const balance = kind === 'count' ? quantity : stock + (kind === 'receipt' ? quantity : -quantity)
  if (balance < 0) return { error: 'Dispatch exceeds available stock.' }
  if (balance > 1000000) return { error: 'Balance exceeds the supported stock limit.' }
  return { balance }
}

// Keep missing counts distinct from zero and never add unlike stock units.
export function inventorySummary(items) {
  const groups = new Map()
  for (const item of items) {
    const category = item.category || 'Uncategorised'
    const unit = item.unit || 'pcs'
    const key = JSON.stringify([category, unit])
    if (!groups.has(key)) groups.set(key, { category, unit, products: 0, recorded: 0, unknown: 0, total: 0 })
    const group = groups.get(key)
    group.products++
    if (Number.isSafeInteger(item.stock) && item.stock >= 0) {
      group.recorded++
      group.total += item.stock
    } else group.unknown++
  }
  return [...groups.values()].map(group => ({ ...group, total: group.recorded ? group.total : null }))
}

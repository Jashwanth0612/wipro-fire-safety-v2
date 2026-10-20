import { useState } from 'react'
import { inventoryCategories, inventoryPage } from '../lib/inventory.mjs'

function statusOf(item) {
  if (item.stock == null) return { label: 'Opening count needed', tone: 'unknown' }
  if (item.stock === 0) return { label: 'Out of stock', tone: 'low' }
  if (item.stock <= (item.minStock ?? 5)) return { label: 'Needs restocking', tone: 'low' }
  return { label: 'In stock', tone: 'healthy' }
}

export default function InventoryCatalogue({ items, loading, loaded, onRefresh, onArchive, busy }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [view, setView] = useState('catalogue')
  const result = inventoryPage(items, { search, category, stock, page, pageSize })
  const categories = inventoryCategories(items)
  const reset = () => { setSearch(''); setCategory(''); setStock('all'); setPage(1) }
  const filter = (setter, value) => { setter(value); setPage(1) }
  const paging = <div className="inventory-pagination">
    <span>Page {result.page} of {result.pages}</span>
    <div><button type="button" disabled={loading || result.page === 1} onClick={() => setPage(result.page - 1)}>Previous</button>
    <button type="button" disabled={loading || result.page === result.pages} onClick={() => setPage(result.page + 1)}>Next</button></div>
  </div>

  return <section className="inventory-catalogue" aria-labelledby="inventory-catalogue-title" aria-busy={loading}>
    <header className="inventory-catalogue-heading">
      <div><p className="eyebrow">INVENTORY DIRECTORY</p><h2 id="inventory-catalogue-title">Find what you need.</h2>
      <p>Search the full inventory. Review a few products at a time.</p></div>
      <button type="button" onClick={onRefresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh inventory'}</button>
    </header>
    <div className="inventory-view-switch" role="group" aria-label="Inventory view">
      <button type="button" aria-pressed={view === 'catalogue'} onClick={() => setView('catalogue')}>Product catalogue</button>
      <button type="button" aria-pressed={view === 'levels'} onClick={() => setView('levels')}>Stock levels</button>
    </div>
    <div className="inventory-directory-filters">
      <label>Find a product<input type="search" value={search} onChange={e => filter(setSearch, e.target.value)} placeholder="Name, reference or description" /></label>
      <label>Category<select value={category} onChange={e => filter(setCategory, e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
      <label>Stock status<select value={stock} onChange={e => filter(setStock, e.target.value)}><option value="all">All stock</option><option value="low">Needs restocking</option><option value="unknown">Opening count needed</option><option value="healthy">In stock</option></select></label>
      <label>Per page<select value={pageSize} onChange={e => filter(setPageSize, Number(e.target.value))}>{[8,16,24].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
    </div>
    <div className="inventory-result-count"><p role="status">{loading ? 'Loading inventory…' : loaded ? `${result.start}–${result.end} of ${result.total} products${result.total !== items.length ? ` · ${items.length} in full inventory` : ''}` : 'Inventory could not be loaded.'}</p>
      {(search || category || stock !== 'all') && <button type="button" onClick={reset}>Clear filters</button>}
    </div>
    {paging}
    {loading ? <p className="inventory-empty">Loading products…</p> : !loaded ? <p className="inventory-empty">Use Refresh inventory to try again.</p> : !result.total ? <div className="inventory-empty"><h3>{items.length ? 'No matching products' : 'Your catalogue is empty'}</h3><p>{items.length ? 'Try another name or clear your filters.' : 'Use Add Product above to create your first product.'}</p>{items.length > 0 && <button type="button" onClick={reset}>Clear filters</button>}</div>
    : view === 'catalogue' ? <div className="inventory-directory-table"><table><caption className="sr-only">Product catalogue, page {result.page} of {result.pages}</caption><thead><tr>{['Product', 'Category', 'Stock', 'Minimum', 'Status', 'Action'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
      {result.items.map(item => { const status = statusOf(item); return <tr key={item.id}>
        <td><div className="inventory-product-name">{item.image_url && <img src={item.image_url} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />}<div><strong>{item.title}</strong><small>{item.slug || 'No catalogue reference'}</small><details><summary>Details</summary><p>{item.description}</p></details></div></div></td>
        <td>{item.category}</td><td><strong>{item.stock ?? 'Not recorded'}</strong>{item.stock != null && <small>{item.unit || 'pcs'}</small>}</td><td>{item.minStock ?? 5} {item.unit || 'pcs'}</td>
        <td><span className={`inventory-status ${status.tone}`}>{status.label}</span></td>
        <td><button type="button" className="inventory-archive" disabled={busy} aria-label={`Archive ${item.title}${item.slug ? ` ${item.slug}` : ''}`} onClick={() => onArchive(item.id)}>Archive</button></td>
      </tr> })}
    </tbody></table></div>
    : <div className="inventory-level-grid" aria-label="Stock levels for this page">
      {result.items.map(item => { const status = statusOf(item); const minimum = item.minStock ?? 5;
        return <article key={item.id} className="inventory-level-card">
          <div><h3>{item.title}</h3><small>{item.slug || item.category}</small></div>
          <div className="inventory-level-quantity"><strong>{item.stock ?? 'Not recorded'}</strong>{item.stock != null && <span>{item.unit || 'pcs'}</span>}</div>
          <span className={`inventory-status ${status.tone}`}>{status.label}</span>
          <p>Minimum: {minimum} {item.unit || 'pcs'}</p>
          {item.stock == null ? <p className="inventory-level-note">Record an opening count above to start tracking.</p> : <p className="inventory-level-note">{item.stock <= minimum ? 'At or below your minimum stock level.' : `${item.stock - minimum} ${item.unit || 'pcs'} above your minimum.`}</p>}
        </article>
      })}
    </div>}
    {result.total > pageSize && paging}
  </section>
}

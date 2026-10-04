import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle, Download, FileText, Flame, Package, Phone, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES, PRODUCTS } from '../data/products'
import { useQuote } from '../context/QuoteContext'
import { filterProducts } from '../lib/catalog'

export default function Products() {
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const { items, add } = useQuote()
  const navigate = useNavigate()
  const dialog = useRef(null)
  const filtered = filterProducts(PRODUCTS, category, query, sort)
  const has = id => items.some(item => item.id === id)
  useEffect(() => {
    const element = dialog.current
    if (selected && !element.open) element.showModal()
    if (!selected && element.open) element.close()
    if (!selected) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [selected])
  const reset = () => { setQuery(''); setCategory('all'); setSort('featured') }
  const enquire = product => { add(product.id); setSelected(null); navigate('/contact#inquiry') }

  return (
    <div className="catalog-page">
      <div className="catalog-intro"><header className="page-heading container">
        <p className="eyebrow"><Flame size={16} /> EQUIPMENT & SOLUTIONS</p>
        <div className="heading-row"><div><h1>Protection, <span>in every detail.</span></h1><p className="lede">Stockist, suppliers and contractors for fire hydrant systems, sprinklers, FM200, fire alarms, extinguishers, industrial safety and road safety equipment.</p></div><a className="button button-secondary" href="/WIPRO_BROCHURE.pdf" download="Wipro_Fire_Safety_Brochure.pdf"><Download size={18} /> Product brochure</a></div>
        <div className="trust-line"><span><CheckCircle size={16} /> ISI Certified</span><span><CheckCircle size={16} /> Fire Dept Approved</span><span><Package size={16} /> 40 Product Categories</span><span>Supply · Install · AMC</span></div>
      </header></div>
      <section className="container catalog-section" aria-label="Product catalogue">
        <div className="catalog-tools">
          <label className="search-box"><Search size={21} /><span className="sr-only">Search products or model numbers</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, models or applications…" />{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="Clear search"><X size={18} /></button>}</label>
          <label className="sort-box"><SlidersHorizontal size={17} /><span className="sr-only">Sort products</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured first</option><option value="name">Name: A–Z</option></select></label>
        </div>
        <div className="category-list" aria-label="Product categories">
          {[{id:'all',label:'All products'},...CATEGORIES].map(cat => <button key={cat.id} className={`category-chip ${category === cat.id ? 'is-active' : ''}`} aria-pressed={category === cat.id} onClick={() => setCategory(cat.id)}>{cat.label}<span>{cat.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat.id).length}</span></button>)}
        </div>
        <div className="results-line"><p role="status" aria-live="polite">Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'product' : 'products'}{query && <> for “{query}”</>}</p>{(query || category !== 'all') && <button className="text-button" onClick={reset}>Reset filters</button>}</div>
        {filtered.length ? <div className="product-grid">{filtered.map(product => <article className="product-card" key={product.id}>
          <button className="product-image" onClick={() => setSelected(product)} aria-label={`View ${product.title}, ${product.subtitle}`}><img src={product.img} alt={`${product.title} — ${product.subtitle}`} loading="lazy" width="460" height="320" /><span className="product-category">{CATEGORIES.find(cat => cat.id === product.category)?.label}</span></button>
          <div className="product-body"><p className="product-subtitle">{product.subtitle}</p><h2><button onClick={() => setSelected(product)}>{product.title}</button></h2><p className="product-description">{product.desc}</p><div className="model-tags">{product.models.slice(0,3).map(model => <span key={model}>{model}</span>)}{product.models.length > 3 && <span>+{product.models.length - 3} more</span>}</div><div className="product-features">{product.features.slice(0,2).map(feature => <span key={feature}>{feature}</span>)}</div><div className="product-actions"><button className="text-button" onClick={() => setSelected(product)}>Details <ArrowRight size={16} /></button><button className={`shortlist-button ${has(product.id) ? 'is-added' : ''}`} onClick={() => add(product.id)} aria-label={`${has(product.id) ? 'Added to quote:' : 'Add to quote:'} ${product.title}, ${product.subtitle}`} disabled={has(product.id)}>{has(product.id) ? <Check size={16} /> : <Plus size={16} />}{has(product.id) ? 'Added' : 'Add to quote'}</button></div></div>
        </article>)}</div> : <div className="empty-state"><Search size={32} /><h2>No matching products</h2><p>Try a product name, model number, or a different category.</p><button className="button button-secondary" onClick={reset}>Show all products</button></div>}
        {items.length > 0 && <div className="quote-bar" role="region" aria-label="Your quote shortlist"><div><strong>{items.length} {items.length === 1 ? 'product' : 'products'} in your quote</strong><span>Review quantities and send one enquiry.</span></div><Link className="button" to="/contact#inquiry">Review quote <ArrowRight size={18} /></Link></div>}
      </section>
      <section className="container brochure-section"><div className="brochure-card"><div className="brochure-icon"><FileText size={32} /></div><div><p className="eyebrow">THE COMPLETE RANGE</p><h2>Full Product Catalogue</h2><p>Complete brochure with all products, ISI certifications, model numbers and technical specifications.</p><p className="muted">40+ Products · ISI Certified · Full Specs · PDF, 3.8 MB</p></div><a className="button button-secondary" href="/WIPRO_BROCHURE.pdf" download="Wipro_Fire_Safety_Brochure.pdf"><Download size={18} /> Download brochure</a></div></section>
      <section className="container catalog-cta"><p className="eyebrow">CUSTOM ORDERS WELCOME</p><h2>Need a custom order?</h2><p>Bulk orders, custom configurations, AMC contracts and competitive pricing for all industries.</p><div className="button-row"><Link className="button" to="/contact">Get a quote <ArrowRight size={18} /></Link><a className="button button-secondary" href="tel:+918019918288"><Phone size={17} /> +91 80199 18288</a></div></section>
      <dialog ref={dialog} className="product-dialog" aria-labelledby="product-detail-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null) }}>
        {selected && <div><button className="dialog-close icon-button" onClick={() => setSelected(null)} aria-label="Close product details" autoFocus><X size={22} /></button><div className="detail-image"><img src={selected.img} alt={selected.title} /></div><div className="detail-content"><p className="eyebrow">{selected.subtitle}</p><h2 id="product-detail-title">{selected.title}</h2><p>{selected.desc}</p><p className="certification-note"><CheckCircle size={16} /> {selected.isi}</p>{selected.fireClass.length > 0 && <div className="fire-classes"><span>Fire class</span>{selected.fireClass.map(c => <span className="fire-class" key={c}>{c}</span>)}</div>}<h3>Available models</h3><div className="model-tags">{selected.models.map(model => <span key={model}>{model}</span>)}</div><h3>Key features</h3><ul className="feature-list">{selected.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul><div className="button-row"><button className="button" onClick={() => enquire(selected)}>Enquire now <ArrowRight size={18} /></button><button className="button button-secondary" onClick={() => add(selected.id)} disabled={has(selected.id)}>{has(selected.id) ? <Check size={17} /> : <Plus size={17} />}{has(selected.id) ? 'In your quote' : 'Add to quote'}</button><a className="text-button" href="tel:+918019918288"><Phone size={17} /> Call us</a></div></div></div>}
      </dialog>
    </div>
  )
}

import { createContext, useContext, useEffect, useState } from 'react'
import { PRODUCTS } from '../data/products'
import { apiRequest } from '../lib/api'
import { mergeCatalogue, safeProductImage } from '../lib/live-catalog'

const QuoteContext = createContext(null)
const KEY = 'wipro-quote-v1'
const validIds = new Set(PRODUCTS.map(product => product.id))
const quantityOf = value => Math.min(999, Math.max(1, Math.floor(Number(value) || 1)))
function readQuote() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || '[]')
    if (!Array.isArray(saved)) return []
    const seen = new Set()
    return saved.slice(0, 100).filter(item => {
      const validLive = typeof item?.id === 'string' && item.id.startsWith('api:') && typeof item.snapshot?.title === 'string'
      if (!item || (!validIds.has(item.id) && !validLive) || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    }).map(item => ({ id: item.id, quantity: quantityOf(item.quantity), ...(item.snapshot ? { snapshot: { id: item.id, title: String(item.snapshot.title).slice(0,200), subtitle: String(item.snapshot.subtitle || '').slice(0,200), img: safeProductImage(item.snapshot.img), models: Array.isArray(item.snapshot.models) ? item.snapshot.models.filter(model => typeof model === 'string').slice(0,30) : [] } } : {}) }))
  } catch { return [] }
}
export function QuoteProvider({ children }) {
  const [items, setItems] = useState(readQuote)
  const [catalogue, setCatalogue] = useState(PRODUCTS)
  const [catalogueStatus, setCatalogueStatus] = useState('loading')
  useEffect(() => {
    let controller
    const refresh = () => {
      controller?.abort()
      const requestController = new AbortController()
      controller = requestController
      apiRequest('/products', { signal: requestController.signal }).then(records => {
        if (requestController.signal.aborted) return
        setCatalogue(mergeCatalogue(PRODUCTS, records))
        setCatalogueStatus('ready')
      }).catch(() => { if (!requestController.signal.aborted) setCatalogueStatus('offline') })
    }
    refresh()
    window.addEventListener('wipro:catalogue-changed', refresh)
    return () => { controller?.abort(); window.removeEventListener('wipro:catalogue-changed', refresh) }
  }, [])
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(items)) } catch { /* Browsing still works when storage is disabled. */ }
  }, [items])
  const add = id => {
    const product = catalogue.find(product => product.id === id)
    if (product) setItems(current => current.some(item => item.id === id) || current.length >= 100 ? current : [...current, { id, quantity: 1, ...(typeof id === 'string' ? { snapshot: { id, title: product.title, subtitle: product.subtitle, img: product.img, models: product.models } } : {}) }])
  }
  const remove = id => setItems(current => current.filter(item => item.id !== id))
  const updateQuantity = (id, quantity) => setItems(current => current.map(item => item.id === id ? { ...item, quantity: quantityOf(quantity) } : item))
  const clear = () => setItems([])
  const products = items.map(item => ({ ...(catalogue.find(product => product.id === item.id) || item.snapshot), quantity: item.quantity }))
  return <QuoteContext.Provider value={{ items, products, catalogue, catalogueStatus, add, remove, updateQuantity, clear }}>{children}</QuoteContext.Provider>
}
export function useQuote() { return useContext(QuoteContext) }

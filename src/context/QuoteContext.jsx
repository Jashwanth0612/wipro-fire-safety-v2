import { createContext, useContext, useEffect, useState } from 'react'
import { PRODUCTS } from '../data/products'

const QuoteContext = createContext(null)
const KEY = 'wipro-quote-v1'
const validIds = new Set(PRODUCTS.map(product => product.id))
function readQuote() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || '[]')
    if (!Array.isArray(saved)) return []
    const seen = new Set()
    return saved.filter(item => {
      if (!item || !validIds.has(item.id) || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    }).map(item => ({ id: item.id, quantity: Math.min(999, Math.max(1, Math.floor(Number(item.quantity) || 1))) }))
  } catch { return [] }
}
export function QuoteProvider({ children }) {
  const [items, setItems] = useState(readQuote)
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(items)) } catch { /* Browsing still works when storage is disabled. */ }
  }, [items])
  const add = id => {
    if (validIds.has(id)) setItems(current => current.some(item => item.id === id) ? current : [...current, { id, quantity: 1 }])
  }
  const remove = id => setItems(current => current.filter(item => item.id !== id))
  const updateQuantity = (id, quantity) => setItems(current => current.map(item => item.id === id ? { ...item, quantity: Math.min(999, Math.max(1, Math.floor(Number(quantity) || 1))) } : item))
  const clear = () => setItems([])
  const products = items.map(item => ({ ...PRODUCTS.find(product => product.id === item.id), quantity: item.quantity }))
  return <QuoteContext.Provider value={{ items, products, add, remove, updateQuantity, clear }}>{children}</QuoteContext.Provider>
}
export function useQuote() { return useContext(QuoteContext) }

import { quoteMessage } from './catalog.js'

// Vercel proxies /api to the configured backend. Both public and admin pages
// use this one contract; never put database or admin secrets in VITE_ variables.
export function normalizeApiBase(value = '/api') {
  const base = value.trim().replace(/\/+$/, '')
  return base.endsWith('/api') ? base : `${base}/api`
}
export const API_BASE = normalizeApiBase(import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || '/api')

export async function apiRequest(path, { method = 'GET', body, token, signal, timeout = 30000 } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, timeout)
  try {
    const response = await fetch(`${API_BASE}/${path.replace(/^\/+/, '')}`, {
      method, signal: controller.signal, cache: 'no-store',
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    const isJson = response.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await response.json().catch(() => null) : null
    if (!response.ok || !isJson || data === null) {
      const message = response.status === 401 || response.status === 403 ? 'Your session has expired. Please sign in again.'
        : response.status === 429 ? 'Too many requests. Please wait a moment and try again.'
        : typeof data?.detail === 'string' ? data.detail
        : 'The service could not confirm this request. Please try again or contact our team.'
      const error = new Error(message)
      error.status = response.status
      throw error
    }
    return data
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

export async function submitInquiry(form, products, { signal } = {}) {
  const payload = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: quoteMessage(form.message, products), products: products.map(({ id, title, subtitle, quantity, models }) => ({ id: String(id), title, subtitle, quantity, models })) }
  const receipt = await apiRequest('/contact', { method: 'POST', body: payload, signal })
  if (typeof receipt.id !== 'string' || !receipt.id.trim()) throw new Error('The service did not confirm that your enquiry was saved.')
  return receipt
}

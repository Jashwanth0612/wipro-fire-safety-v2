import { quoteMessage } from './catalog.js'

// Vercel routes /api to the Python backend function. Both public and admin pages
// use this one contract; never put database or admin secrets in VITE_ variables.
export function normalizeApiBase(value = '/api') {
  const base = value.trim().replace(/\/+$/, '')
  return base.endsWith('/api') ? base : `${base}/api`
}
export const API_BASE = normalizeApiBase(import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || '/api')
let adminCsrf = null
export const setAdminCsrf = value => { adminCsrf = value }

export async function apiRequest(path, { method = 'GET', body, signal, timeout = 30000 } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  else signal?.addEventListener('abort', abort, { once: true })
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; abort() }, timeout)
  const recovery = method === 'GET' || method === 'HEAD'
    ? 'Please check your connection and try again.'
    : path.replace(/^\/+/, '') === 'inventory/movements'
      ? 'Your stock update may already be saved. Use “Retry same entry safely” in this tab to confirm it.'
      : 'We could not confirm whether your changes were saved. Check the result before submitting again.'
  try {
    const response = await fetch(`${API_BASE}/${path.replace(/^\/+/, '')}`, {
      method, signal: controller.signal, cache: 'no-store', credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(adminCsrf && !['GET', 'HEAD'].includes(method) ? { 'X-CSRF-Token': adminCsrf } : {}) },
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
  } catch (error) {
    // Navigation/unmount cancellation is not a service failure.
    if (signal?.aborted) throw error
    if (timedOut || error instanceof TypeError) {
      const failure = new Error(`${timedOut ? 'The request took too long.' : 'Could not connect to the service.'} ${recovery}`)
      failure.code = timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR'
      // No HTTP status: a failed transport cannot prove a mutation was rejected.
      throw failure
    }
    throw error
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

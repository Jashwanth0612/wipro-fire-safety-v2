import { quoteMessage } from './catalog.js'

export const API_BASE = (import.meta.env?.VITE_API_BASE_URL || 'https://wipro-backend-q5i7.onrender.com/api').replace(/\/$/, '')

export async function submitInquiry(form, products, { signal } = {}) {
  const payload = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: quoteMessage(form.message, products) }
  const response = await fetch(`${API_BASE}/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal,
  })
  if (!response.ok) throw new Error('Inquiry could not be saved')
  return response
}

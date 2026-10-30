import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { apiRequest, setAdminCsrf } from '../lib/api'

const Context = createContext(null)

export function AdminSessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [state, setState] = useState('checking')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const generation = useRef(0)
  const accept = data => {
    if (typeof data?.user_id !== 'string' || typeof data?.csrf_token !== 'string' || !Number.isFinite(data.expires_at)) throw new Error('The server did not confirm your staff session.')
    generation.current++
    setAdminCsrf(data.csrf_token)
    setSession(data)
    setState('ready')
  }
  const clear = () => { generation.current++; setAdminCsrf(null); setSession(null); setState('signed-out') }
  useEffect(() => {
    // Remove sessions left by the previous release; credentials now stay HttpOnly.
    try { localStorage.removeItem('admin_token') } catch { /* storage is optional */ }
    const controller = new AbortController()
    const currentGeneration = generation.current
    apiRequest('/admin/session', { signal: controller.signal })
      .then(data => { if (generation.current === currentGeneration) accept(data) })
      .catch(err => {
        if (controller.signal.aborted || generation.current !== currentGeneration) return
        if ([401, 403].includes(err.status)) clear()
        else { setError(err.message); setState('error') }
      })
    return () => controller.abort()
  }, [revision])
  useEffect(() => {
    if (!session) return
    const timer = setTimeout(clear, Math.max(0, session.expires_at * 1000 - Date.now()))
    return () => clearTimeout(timer)
  }, [session])
  const logout = async () => { await apiRequest('/admin/logout', { method: 'POST', body: {} }); clear() }
  return <Context.Provider value={{ session, state, error, accept, clear, logout, retry: () => { setState('checking'); setRevision(v => v + 1) } }}>{children}</Context.Provider>
}

export const useAdminSession = () => useContext(Context)

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [service, setService] = useState('checking')
  const [check, setCheck] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setService('checking')
    apiRequest('/health', { signal: controller.signal, timeout: 15000 })
      .then(data => setService(data.status === 'ready' ? 'ready' : 'unavailable'))
      .catch(() => { if (!controller.signal.aborted) setService('unavailable') })
    return () => controller.abort()
  }, [check])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)

  const login = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setError('')
    try {
      const data = await apiRequest('/admin/login', { method: 'POST', body: { email: email.trim(), password } })
      const token = data?.access_token || data?.token
      if (typeof token !== 'string' || !token) throw new Error('The server did not return a valid session. Please try again.')
      localStorage.setItem('admin_token', token)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Invalid email or password.' : err.message || 'We could not sign you in. Please try again.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <section className="admin-entry container">
      <div className="admin-entry-intro">
        <p className="eyebrow">WIPRO FIRE & SAFETY · STAFF PORTAL</p>
        <h1>Your business.<br />One workspace.</h1>
        <p>Manage your product catalogue, monitor stock and keep every customer enquiry moving.</p>
        <ul><li>Product list, categories and inventory quantities</li><li>Low-stock alerts and Excel stock reports</li><li>Customer enquiries, follow-ups and monthly overview</li></ul>
        <Link to="/">Back to website →</Link>
      </div>
      <div className="admin-entry-card">
        <p className="eyebrow">AUTHORIZED STAFF</p>
        <h2>Admin login</h2>
        <p>Sign in with your staff account to open the dashboard.</p>
        <div className={`admin-service ${service}`} role="status">
          {service === 'checking' ? 'Checking admin service…' : service === 'ready' ? 'Admin service is available.' : 'Admin service is currently unavailable. Sign-in and saved records need an active database connection.'}
          {service === 'unavailable' && <button className="text-button" type="button" onClick={() => setCheck(value => value + 1)}>Check again</button>}
        </div>
        {!error && location.state?.message && <p role="status">{location.state.message}</p>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <form onSubmit={login} aria-busy={pending}>
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" autoComplete="username" disabled={pending} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-field">
            <input id="admin-password" autoComplete="current-password" disabled={pending} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
          <button className="button" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in to dashboard'}</button>
        </form>
        <p className="admin-entry-note">Access is restricted to approved staff. For account access, contact your website administrator.</p>
      </div>
    </section>
  )
}

export default AdminLogin

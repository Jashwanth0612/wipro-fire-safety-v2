import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function AdminLogin() {
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
    <div style={{ padding: '60px 24px', maxWidth: '440px', margin: 'auto' }}>
      <h2>Admin Login</h2>
      {!error && location.state?.message && <p role="status">{location.state.message}</p>}
      {error && <p role="alert" style={{ color: '#62584f', marginBottom: '12px' }}>{error}</p>}
      <form onSubmit={login} aria-busy={pending}>
        <label htmlFor="admin-email" className="sr-only">Admin email</label>
        <input
          style={input}
          id="admin-email"
          autoComplete="username"
          disabled={pending}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="admin-password" className="sr-only">Password</label>
        <input
          id="admin-password"
          autoComplete="current-password"
          disabled={pending}
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={button} type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Login'}</button>
      </form>
    </div>
  )
}

const input = {
  width: '100%',
  padding: '10px',
  marginBottom: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  background: '#fff9f0',
  color: '#302820'
}

const button = {
  width: '100%',
  padding: '12px',
  background: '#b84030',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
}

export default AdminLogin

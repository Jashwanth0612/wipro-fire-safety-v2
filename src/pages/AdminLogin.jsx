import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('https://wipro-backend-q5i7.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('admin_token', data.access_token)
        navigate('/admin/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Server not reachable')
    }
  }

  return (
    <div style={{ padding: '60px 24px', maxWidth: '440px', margin: 'auto' }}>
      <h2>Admin Login</h2>
      {error && <p style={{ color: '#62584f', marginBottom: '12px' }}>{error}</p>}
      <form onSubmit={login}>
        <input
          style={input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={button} type="submit">Login</button>
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

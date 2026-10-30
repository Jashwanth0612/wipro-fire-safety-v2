import { Navigate } from 'react-router-dom'
import { useAdminSession } from './AdminSession'

// Verify the server session before downloading or mounting staff screens.
// Every staff API independently checks the session and database membership too.
export default function RequireAdminSession({ children }) {
  const { state, error, retry } = useAdminSession()
  if (state === 'checking') return <p role="status" className="container">Checking staff session…</p>
  if (state === 'error') return <div className="container"><p role="alert">{error}</p><button onClick={retry}>Check again</button></div>
  return state === 'ready' ? children : <Navigate to="/admin/login" replace />
}

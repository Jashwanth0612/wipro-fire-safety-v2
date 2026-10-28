import { Navigate } from 'react-router-dom'

// This prevents signed-out screen flashes and unnecessary route downloads.
// Token presence is NOT authorization: every staff API still verifies the token
// and staff membership, and page handlers still redirect on 401/403.
export default function RequireAdminSession({ children }) {
  let token = null
  try { token = localStorage.getItem('admin_token') } catch { /* unavailable storage stays signed out */ }
  return token ? children : <Navigate to="/admin/login" replace />
}

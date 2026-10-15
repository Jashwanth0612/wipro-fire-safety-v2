import { NavLink } from 'react-router-dom'

export default function AdminNavigation() {
  return <nav className="admin-navigation" aria-label="Administration">
    <NavLink to="/admin/dashboard">Overview & enquiries</NavLink>
    <NavLink to="/admin/products">Products & stock</NavLink>
    <NavLink to="/products">View public catalogue</NavLink>
  </nav>
}

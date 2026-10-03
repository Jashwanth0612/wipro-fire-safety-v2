import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Flame, Menu, X, Phone, MessageCircle, ClipboardList, UserRound, LogOut, LayoutDashboard, Package } from 'lucide-react'
import AIChat from './AIChat'
import { useQuote } from '../context/QuoteContext'

// Original tips are retained. Reduced-motion visitors see a stable first tip.
const SAFETY_TIPS = [
  'Never block emergency exits — keep them clear at all times',
  'Test your fire alarm monthly — dead batteries cost lives',
  'A fire extinguisher should be within 23 meters of any fire risk',
  'Fire extinguishers expire — check the gauge every 6 months',
  '18,545 office fires were reported in India in 2021 alone',
  'Most fire deaths occur at night due to smoke inhalation',
]
const links = [['/','Home'],['/about','About'],['/products','Products'],['/services','Services'],['/clients','Clients'],['/contact','Contact']]
export default function Navbar() {
  const [menuOpen,setMenuOpen] = useState(false)
  const [accountOpen,setAccountOpen] = useState(false)
  const [chatOpen,setChatOpen] = useState(false)
  const [tipIndex,setTipIndex] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { items } = useQuote()
  const accountRef = useRef(null)
  const menuButtonRef = useRef(null)
  const isLoggedIn = !!localStorage.getItem('admin_token')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setTipIndex(index => (index + 1) % SAFETY_TIPS.length), 8000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => { setMenuOpen(false); setAccountOpen(false) }, [location.pathname])
  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') {
        if (menuOpen) menuButtonRef.current?.focus()
        setMenuOpen(false); setAccountOpen(false); setChatOpen(false)
      }
    }
    const onPointer = event => { if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false) }
    document.addEventListener('keydown',onKey); document.addEventListener('pointerdown',onPointer)
    return () => { document.removeEventListener('keydown',onKey); document.removeEventListener('pointerdown',onPointer) }
  }, [menuOpen])
  const logout = () => { localStorage.removeItem('admin_token'); setAccountOpen(false); navigate('/') }
  return <>
    <header className="site-header">
      <div className="utility-bar"><div className="container utility-inner"><span className="tip-label"><Flame size={14} /> SAFETY TIP</span><span className="safety-tip">{SAFETY_TIPS[tipIndex]}</span><span className="utility-location">Kurnool · Serving South India</span></div></div>
      <div className="container nav-shell">
        <Link className="brand-link" to="/" aria-label="Wipro Fire and Safety home"><img className="company-logo" src="/company-logo-dark.png?v=2" alt="Wipro Fire & Safety — Consultants, Stockists, Suppliers" width="1976" height="796" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([to,label]) => <NavLink end={to === '/'} key={to} to={to}>{label}</NavLink>)}</nav>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Open safety assistant" title="Safety assistant" onClick={() => setChatOpen(true)}><MessageCircle size={20} /></button>
          <Link className="icon-button quote-link" to="/contact#inquiry" aria-label={`Your quote, ${items.length} products`} title="Your quote"><ClipboardList size={21} />{items.length > 0 && <span className="quote-count">{items.length}</span>}</Link>
          <a className="nav-call" href="tel:+918019918288"><Phone size={16} /><span>Call now</span></a>
          <div ref={accountRef} className="account-wrap"><button className="icon-button account-trigger" aria-label="Account options" aria-expanded={accountOpen} aria-controls="account-options" onClick={() => setAccountOpen(!accountOpen)}><UserRound size={20} /></button>{accountOpen && <div id="account-options" className="account-menu">{isLoggedIn ? <><Link to="/admin/dashboard"><LayoutDashboard size={16} />Dashboard</Link><Link to="/admin/products"><Package size={16} />Products</Link><button onClick={logout}><LogOut size={16} />Log out</button></> : <Link to="/admin/login"><UserRound size={16} />Admin login</Link>}</div>}</div>
          <button ref={menuButtonRef} className="icon-button menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </div>
      {menuOpen && <nav className="mobile-nav container" id="mobile-navigation" aria-label="Mobile navigation">{links.map(([to,label]) => <NavLink end={to === '/'} key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}<a href="tel:+918019918288"><Phone size={16} /> Call +91 80199 18288</a></nav>}
    </header>
    <AIChat open={chatOpen} onClose={() => setChatOpen(false)} />
  </>
}

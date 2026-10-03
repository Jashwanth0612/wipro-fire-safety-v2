import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import Services from './pages/Services'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import CityClients from './pages/CityClients'
import AllClients from './pages/AllClients'
import { QuoteProvider } from './context/QuoteContext'
import RouteMetadata from './components/RouteMetadata'
import { API_BASE } from './lib/api'

// WHY: Every time the route changes, scroll back to top
// Without this, React keeps the scroll position from the previous page
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
    else {
      const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 450)
      return () => clearTimeout(timer)
    }
  }, [pathname, hash])
  return null
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.35, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/clients" element={<PageWrapper><AllClients /></PageWrapper>} />
        <Route path="/clients/:city" element={<PageWrapper><CityClients /></PageWrapper>} />
        <Route path="*" element={<div className="container catalog-cta"><h1>Page not found</h1><p>This page may have moved.</p><a className="button" href="/">Back to home</a></div>} />
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/admin/products" element={<PageWrapper><AdminProducts /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  useEffect(() => {
    if (import.meta.env.DEV) return
    const ping = () => fetch(`${API_BASE}/`).catch(() => {})
    ping()
    const interval = setInterval(ping, 14 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
      <QuoteProvider>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <RouteMetadata />
      <ScrollToTop />
      <Navbar />
      <main id="main-content" tabIndex="-1"><AnimatedRoutes /></main>
      <WhatsAppButton />
      <Footer />
      </QuoteProvider>
      </MotionConfig>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import RequireAdminSession from './components/RequireAdminSession'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import { QuoteProvider } from './context/QuoteContext'
import RouteMetadata from './components/RouteMetadata'

const About = lazy(() => import('./pages/About'))
const Products = lazy(() => import('./pages/Products'))
const Services = lazy(() => import('./pages/Services'))
const Contact = lazy(() => import('./pages/Contact'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const CityClients = lazy(() => import('./pages/CityClients'))
const AllClients = lazy(() => import('./pages/AllClients'))

// Mount inside Suspense so hash targets exist before scrolling, even on a slow chunk download.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
    else {
      const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }), 450)
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
    <RouteErrorBoundary>
      <Suspense fallback={<div className="container route-feedback" role="status" aria-live="polite">Loading page…</div>}>
        <ScrollToTop />
        {children}
      </Suspense>
    </RouteErrorBoundary>
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
        <Route path="*" element={<PageWrapper><div className="container catalog-cta"><h1>Page not found</h1><p>This page may have moved.</p><a className="button" href="/">Back to home</a></div></PageWrapper>} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin/dashboard" element={<RequireAdminSession><PageWrapper><AdminDashboard /></PageWrapper></RequireAdminSession>} />
        <Route path="/admin/products" element={<RequireAdminSession><PageWrapper><AdminProducts /></PageWrapper></RequireAdminSession>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
      <QuoteProvider>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <RouteMetadata />
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

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const complete = setTimeout(() => setVisible(false), 900)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setVisible(false), 400); return 100 }
        return p + Math.random() * 15 + 5
      })
    }, 120)
    return () => { clearInterval(interval); clearTimeout(complete) }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}
        >
          <style>{`
            @keyframes fireRise {
              0% { transform: translateY(0) scale(1); opacity: 0.8; }
              50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
              100% { transform: translateY(0) scale(1); opacity: 0.8; }
            }
            @keyframes flicker { 0%,100%{opacity:1;transform:scaleY(1)} 50%{opacity:0.85;transform:scaleY(0.95)} }
          `}</style>

          {/* Fire Icon */}
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)', borderRadius: '50%', animation: 'fireRise 1.5s ease-in-out infinite', filter: 'blur(8px)' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: '8px' }}>
              <span style={{ fontSize: '56px', animation: 'flicker 0.8s ease-in-out infinite' }}>🔥</span>
            </div>
          </div>

          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '36px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '4px' }}>
              Wipro Fire & <span style={{ color: '#f97316' }}>Safety</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase' }}>Protecting South India Since 2007</p>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '240px' }}>
            <div style={{ height: '2px', background: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, #ea580c, #f97316, #eab308)', borderRadius: '999px' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
              {Math.min(Math.round(progress), 100)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

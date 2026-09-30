import { useEffect, useRef } from 'react'

export default function LivingLogo({ onClick }) {
  const faceRef = useRef(null)
  const leftEye = useRef(null)
  const rightEye = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return
    const move = (e) => {
      if (!wrapRef.current || !faceRef.current) return
      const rect = wrapRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const max = 6
      const x = Math.max(-max, Math.min(max, dx / 22))
      const y = Math.max(-max, Math.min(max, dy / 22))
      faceRef.current.style.transform = `translate(${x}px, ${y}px)`
    }
    const blink = () => {
      if (!leftEye.current || !rightEye.current) return
      leftEye.current.style.height = '1px'
      rightEye.current.style.height = '1px'
      setTimeout(() => {
        if (leftEye.current) leftEye.current.style.height = '3px'
        if (rightEye.current) rightEye.current.style.height = '3px'
      }, 120)
    }
    const blinkInterval = setInterval(blink, 2800)
    window.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('mousemove', move)
      clearInterval(blinkInterval)
    }
  }, [])

  return (
    <button type="button" className="living-assistant" aria-label="Open Wipro AI assistant" title="Ask our assistant" ref={wrapRef} onClick={onClick} onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,180,90,0.35)'
      e.currentTarget.style.border = '1px solid rgba(255,180,90,0.35)'
    }} onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)'
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.border = 'none'
    }} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.5px', fontSize: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '12px', transition: 'all 0.25s ease' }}>
      <div ref={faceRef} style={{ width: '20px', height: '20px', borderRadius: '50%', position: 'relative', background: 'radial-gradient(circle at 30% 30%, #ffd39a, #ff9f3a)', boxShadow: '0 0 16px rgba(255,170,90,0.9)', transition: 'transform 0.12s linear' }}>
        <div ref={leftEye} style={{ position: 'absolute', top: '6px', left: '5px', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', transition: 'height 0.1s ease' }} />
        <div ref={rightEye} style={{ position: 'absolute', top: '6px', right: '5px', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', transition: 'height 0.1s ease' }} />
        <div style={{ position: 'absolute', bottom: '5px', left: '50%', width: '8px', height: '4px', borderBottom: '2px solid rgba(255,255,255,0.8)', borderRadius: '0 0 10px 10px', transform: 'translateX(-50%)' }} />
      </div>
    </button>
  )
}


import { useEffect } from 'react'

function CursorTrail() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return
    let frameId
    const core = document.createElement('div')
    const halo = document.createElement('div')
    const trail1 = document.createElement('div')
    const trail2 = document.createElement('div')

    const baseStyle = {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 9999,
      left: '0px',
      top: '0px',
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%'
    }

    Object.assign(core.style, baseStyle, {
      width: '6px',
      height: '6px',
      background: '#f97316',
      boxShadow: '0 0 12px rgba(249,115,22,1), 0 0 24px rgba(249,115,22,0.6)'
    })

    Object.assign(halo.style, baseStyle, {
      width: '32px',
      height: '32px',
      border: '1.5px solid rgba(249,115,22,0.7)',
      boxShadow: '0 0 20px rgba(249,115,22,0.2)',
      transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease'
    })

    Object.assign(trail1.style, baseStyle, {
      width: '8px',
      height: '8px',
      background: 'rgba(249,115,22,0.4)',
      filter: 'blur(2px)'
    })

    Object.assign(trail2.style, baseStyle, {
      width: '10px',
      height: '10px',
      background: 'rgba(234,179,8,0.3)',
      filter: 'blur(3px)'
    })

    document.body.appendChild(trail2)
    document.body.appendChild(trail1)
    document.body.appendChild(halo)
    document.body.appendChild(core)

    let x = 0, y = 0
    let hx = 0, hy = 0
    let t1x = 0, t1y = 0
    let t2x = 0, t2y = 0

    const move = (e) => {
      x = e.clientX
      y = e.clientY
    }

    const onEnterBtn = () => {
      halo.style.width = '52px'
      halo.style.height = '52px'
      halo.style.borderColor = 'rgba(249,115,22,1)'
      core.style.background = '#eab308'
    }

    const onLeaveBtn = () => {
      halo.style.width = '32px'
      halo.style.height = '32px'
      halo.style.borderColor = 'rgba(249,115,22,0.7)'
      core.style.background = '#f97316'
    }

    const addListeners = () => {
      document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
        el.addEventListener('mouseenter', onEnterBtn)
        el.addEventListener('mouseleave', onLeaveBtn)
      })
    }

    addListeners()
    const refreshInterval = setInterval(addListeners, 2000)

    const animate = () => {
      hx += (x - hx) * 0.12
      hy += (y - hy) * 0.12
      t1x += (x - t1x) * 0.07
      t1y += (y - t1y) * 0.07
      t2x += (x - t2x) * 0.04
      t2y += (y - t2y) * 0.04

      core.style.left = x + 'px'
      core.style.top = y + 'px'
      halo.style.left = hx + 'px'
      halo.style.top = hy + 'px'
      trail1.style.left = t1x + 'px'
      trail1.style.top = t1y + 'px'
      trail2.style.left = t2x + 'px'
      trail2.style.top = t2y + 'px'

      frameId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', move)
    animate()

    return () => {
      window.removeEventListener('mousemove', move)
      clearInterval(refreshInterval)
      cancelAnimationFrame(frameId)
      document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
        el.removeEventListener('mouseenter', onEnterBtn)
        el.removeEventListener('mouseleave', onLeaveBtn)
      })
      ;[core, halo, trail1, trail2].forEach(el => {
        if (document.body.contains(el)) document.body.removeChild(el)
      })
    }
  }, [])

  return null
}

export default CursorTrail

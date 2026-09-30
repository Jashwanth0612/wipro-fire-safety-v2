import { useState } from 'react'

function WhatsAppButton() {
  const [hover, setHover] = useState(false)

  return (
    <a
      href="https://wa.me/918019918288"
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '14px 20px',
        borderRadius: '50px',
        background: 'linear-gradient(135deg, #25D366, #1ebe5d)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: '600',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.25s ease',
        transform: hover ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
        boxShadow: hover
          ? '0 18px 40px rgba(37,211,102,0.45)'
          : '0 8px 20px rgba(0,0,0,0.35)'
      }}
    >
      💬 Chat Now
    </a>
  )
}

export default WhatsAppButton

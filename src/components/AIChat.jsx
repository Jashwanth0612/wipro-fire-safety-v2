import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../lib/api'

function AIChat({ open, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const sessionId = useRef(null)
  if (!sessionId.current) sessionId.current = crypto.randomUUID()

  const suggestions = [
    'What services do you provide?',
    'Do you install fire alarms in malls?',
    'Where is your office located?',
    'Are you ISO certified?',
    'How can I contact you?'
  ]

  useEffect(() => {
    if (open) {
      setMessages([{
        from: 'bot',
        text: 'Hi! I am the Wipro Fire & Safety AI assistant. How can I help you today?'
      }])
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    if (loading) return
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')

    const newMsgs = [...messages, { from: 'user', text: userMsg }]
    setMessages(newMsgs)
    setLoading(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          session_id: sessionId.current
        }),
        signal: controller.signal
      })

      clearTimeout(timeout)
      if (!res.ok) throw new Error('Chat unavailable')
      const data = await res.json()
      const reply = data.response || data.reply || data.message || 'Sorry, no response received.'
      setMessages([...newMsgs, { from: 'bot', text: reply }])

    } catch (err) {
      console.error('Chat error:', err)
      setMessages([...newMsgs, {
        from: 'bot',
        text: err.name === 'AbortError'
          ? 'Response timed out. Please try again.'
          : 'Sorry, I am unavailable. Please call +91 8019918288.'
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={panel} role="dialog" aria-label="Wipro AI assistant">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.3); }
        .chat-input:focus { outline: none; border-color: rgba(249,115,22,0.5) !important; }
        .suggestion-chip:hover { background: rgba(191,73,55,0.25) !important; color: #62584f !important; }
      `}</style>

      {/* Header */}
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(160,135,111,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>W</div>
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', border: '2px solid #bf4937', boxShadow: '0 0 6px #22c55e' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Wipro AI Assistant</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>Online — replies instantly</div>
          </div>
        </div>
        <button type="button" aria-label="Close assistant" className="icon-button" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div style={body}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'user' ? 'flex-end' : 'flex-start', gap: '2px' }}>
            {m.from === 'bot' && (
              <span style={{ fontSize: '10px', color: '#655b51', marginLeft: '4px' }}>Wipro AI</span>
            )}
            <div style={{
              padding: '10px 14px',
              color: '#302820',
              maxWidth: '85%',
              fontSize: '13px',
              lineHeight: '1.6',
              background: m.from === 'user'
                ? 'linear-gradient(135deg, #bf4937, #bf4937)'
                : 'rgba(160,135,111,0.07)',
              borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              border: m.from === 'user' ? 'none' : '1px solid rgba(160,135,111,0.08)'
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: '#655b51', marginLeft: '4px' }}>Wipro AI</span>
            <div style={{ padding: '12px 16px', background: 'rgba(160,135,111,0.07)', border: '1px solid rgba(160,135,111,0.08)', borderRadius: '16px 16px 16px 4px' }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#bf4937',
                    animation: 'bounce 0.9s ease-in-out infinite',
                    animationDelay: `${i * 0.18}s`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(160,135,111,0.06)' }}>
        {suggestions.map(q => (
          <button type="button"
            key={q}
            className="suggestion-chip"
            onClick={() => send(q)}
            style={{ padding: '5px 10px', borderRadius: 20, background: 'rgba(191,73,55,0.1)', border: '1px solid rgba(191,73,55,0.2)', color: '#b84030', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderTop: '1px solid rgba(160,135,111,0.06)' }}>
        <input
          aria-label="Message the assistant"
          className="chat-input"
          style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(160,135,111,0.1)', background: 'rgba(160,135,111,0.05)', color: '#302820', fontSize: '13px' }}
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          aria-label="Send message"
          onClick={() => send()}
          disabled={loading}
          style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: loading ? 'rgba(191,73,55,0.4)' : 'linear-gradient(135deg, #bf4937, #bf4937)', color: '#302820', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 700, transition: 'all 0.2s' }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

const panel = {
  position: 'fixed',
  right: 16,
  bottom: 90,
  width: 'min(340px, calc(100vw - 32px))',
  height: 'min(500px, calc(100dvh - 120px))',
  background: 'rgba(255,249,240,0.97)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 24px 80px rgba(255,249,240,0.8), 0 0 0 1px rgba(191,73,55,0.15)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 9999,
  overflow: 'hidden'
}

const header = {
  padding: '14px 18px',
  background: 'linear-gradient(135deg, #bf4937, #bf4937, #bf4937)',
  color: '#302820',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const body = {
  flex: 1,
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflowY: 'auto',
  scrollbarWidth: 'none'
}

export default AIChat

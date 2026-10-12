import { useState, useEffect, useRef } from 'react'
import { apiRequest } from '../lib/api'

function AIChat({ open, onClose }) {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! I am the Wipro Fire & Safety website assistant. I can help with company information and enquiries.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const controllerRef = useRef(null)
  const sending = useRef(false)
  const [availability, setAvailability] = useState('Company information & enquiries')
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
    if (!open) return
    const trigger = document.activeElement
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => () => controllerRef.current?.abort(), [])
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }, [messages, open])

  const send = async (text) => {
    if (sending.current) return
    const userMsg = (text || input).trim()
    if (!userMsg) return
    sending.current = true
    setInput('')
    setMessages(current => [...current, { from: 'user', text: userMsg }])
    setLoading(true)
    setAvailability('Sending your message…')
    const controller = new AbortController()
    controllerRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      const data = await apiRequest('/chat', { method: 'POST', body: { message: userMsg, session_id: sessionId.current }, signal: controller.signal })
      const reply = data?.response || data?.reply || data?.message
      if (typeof reply !== 'string' || !reply.trim()) throw new Error('No reply received')
      setMessages(current => [...current, { from: 'bot', text: reply }])
      setAvailability('Company information & enquiries')
    } catch (err) {
      setMessages(current => [...current, { from: 'bot', text: err.name === 'AbortError' ? 'The response took too long. Please try again, or call +91 80199 18288.' : 'The assistant is temporarily unavailable. Please call +91 80199 18288 or use our contact form.' }])
      setAvailability('Currently unavailable — please contact our team')
    } finally {
      clearTimeout(timeout)
      sending.current = false
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={panel} role="dialog" aria-label="Wipro website assistant">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .chat-input::placeholder { color: #76675a; }
        .chat-input:focus { outline: none; border-color: rgba(249,115,22,0.5) !important; }
        .suggestion-chip:hover { background: rgba(191,73,55,0.25) !important; color: #62584f !important; }
      `}</style>

      {/* Header */}
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(160,135,111,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>W</div>

          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Wipro Website Assistant</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>{availability}</div>
          </div>
        </div>
        <button type="button" aria-label="Close assistant" className="icon-button" style={{ color: '#fffdf9' }} onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div style={body} role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'user' ? 'flex-end' : 'flex-start', gap: '2px' }}>
            {m.from === 'bot' && (
              <span style={{ fontSize: '10px', color: '#655b51', marginLeft: '4px' }}>Wipro Assistant</span>
            )}
            <div style={{
              padding: '10px 14px',
              color: m.from === 'user' ? '#fffdf9' : '#302820',
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
            <span style={{ fontSize: '10px', color: '#655b51', marginLeft: '4px' }}>Wipro Assistant</span>
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
            disabled={loading}
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
          ref={inputRef}
          maxLength={2000}
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
          style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: loading ? 'rgba(191,73,55,0.4)' : 'linear-gradient(135deg, #bf4937, #bf4937)', color: '#fffdf9', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 700, transition: 'all 0.2s' }}
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
  color: '#fffdf9',
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

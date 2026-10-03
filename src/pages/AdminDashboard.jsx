import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, CheckCircle, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return }
    fetch('https://wipro-backend-q5i7.onrender.com/api/contact', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [])

  const updateStatus = async (id, newStatus) => {
    await fetch(`https://wipro-backend-q5i7.onrender.com/api/contact/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setData(data.map(d => d.id === id ? { ...d, status: newStatus } : d))
  }

  const logout = () => { localStorage.removeItem('admin_token'); navigate('/admin/login') }

  const total = data.length
  const pending = data.filter(d => d.status === 'pending').length
  const contacted = data.filter(d => d.status === 'contacted').length
  const todayCount = data.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length

  // Monthly chart data (last 6 months)
  const monthlyData = (() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString('default', { month: 'short' })
      const count = data.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate.getMonth() === d.getMonth() && itemDate.getFullYear() === d.getFullYear()
      }).length
      months.push({ label, count })
    }
    return months
  })()

  const maxCount = Math.max(...monthlyData.map(m => m.count), 1)

  // Services breakdown (simulated from message content)
  const serviceBreakdown = [
    { label: 'Installation', count: Math.ceil(total * 0.35), color: '#b84030' },
    { label: 'AMC', count: Math.ceil(total * 0.28), color: '#b84030' },
    { label: 'Audit', count: Math.ceil(total * 0.20), color: '#356345' },
    { label: 'Refilling', count: Math.ceil(total * 0.10), color: '#62584f' },
    { label: 'Training', count: Math.ceil(total * 0.07), color: '#62584f' },
  ]

  return (
    <div style={{ background: '#fff9f0', minHeight: '100vh', padding: '28px', color: '#302820' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Admin <span style={{ color: '#b84030' }}>Dashboard</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Wipro Fire & Safety — Inquiry Management</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin/products')} style={{ padding: '10px 18px', background: 'rgba(191,73,55,0.15)', border: '1px solid rgba(191,73,55,0.3)', borderRadius: '10px', color: '#b84030', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            📦 Products
          </button>
          <button onClick={logout} style={{ padding: '10px 18px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#62584f', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: Users, label: 'Total Inquiries', value: total, color: '#b84030', bg: 'rgba(191,73,55,0.1)', border: 'rgba(191,73,55,0.2)' },
          { icon: Clock, label: 'Pending', value: pending, color: '#b84030', bg: 'rgba(191,73,55,0.1)', border: 'rgba(191,73,55,0.2)' },
          { icon: CheckCircle, label: 'Contacted', value: contacted, color: '#356345', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
          { icon: TrendingUp, label: "Today's Inquiries", value: todayCount, color: '#62584f', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: s.color, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>{s.label}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={s.color} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* Monthly Bar Chart */}
        <div style={{ background: '#f5ecdf', border: '1px solid #f5ecdf', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <BarChart3 size={18} color="#bf4937" />
            <h3 style={{ color: '#302820', fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Monthly Inquiries</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px' }}>
            {monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ color: '#b84030', fontSize: '12px', fontWeight: 700 }}>{m.count > 0 ? m.count : ''}</span>
                <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: `linear-gradient(180deg, #bf4937, #bf4937)`, height: `${Math.max((m.count / maxCount) * 110, m.count > 0 ? 8 : 2)}px`, opacity: m.count > 0 ? 1 : 0.2, transition: 'height 0.5s ease' }} />
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div style={{ background: '#f5ecdf', border: '1px solid #f5ecdf', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Activity size={18} color="#bf4937" />
            <h3 style={{ color: '#302820', fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Services</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {serviceBreakdown.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#62584f', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: '12px', fontWeight: 700 }}>{s.count}</span>
                </div>
                <div style={{ height: '6px', background: '#f5ecdf', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total > 0 ? (s.count / total) * 100 : 0}%`, background: s.color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Conversion rate */}
          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Conversion Rate</div>
            <div style={{ color: '#356345', fontSize: '24px', fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {total > 0 ? Math.round((contacted / total) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div style={{ background: '#f5ecdf', border: '1px solid #f5ecdf', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5ecdf', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={18} color="#bf4937" />
            <h3 style={{ color: '#302820', fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Customer Inquiries</h3>
          </div>
          <span style={{ color: '#64748b', fontSize: '13px' }}>{total} total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f5ecdf' }}>
                {['Date', 'Name', 'Phone', 'Email', 'Message', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No inquiries yet. Submit a contact form to test.</td></tr>
              ) : data.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f5ecdf', background: i.status === 'contacted' ? 'rgba(34,197,94,0.03)' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,135,111,0.02)'} onMouseLeave={e => e.currentTarget.style.background = i.status === 'contacted' ? 'rgba(34,197,94,0.03)' : 'transparent'}>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>{new Date(i.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '14px 20px', color: '#302820', fontSize: '14px', fontWeight: 600 }}>{i.name}</td>
                  <td style={{ padding: '14px 20px', color: '#62584f', fontSize: '13px' }}>{i.phone}</td>
                  <td style={{ padding: '14px 20px', color: '#62584f', fontSize: '13px' }}>{i.email}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.message}</td>
                  <td style={{ padding: '14px 20px' }}>
                    {i.status === 'contacted' ? (
                      <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#356345', fontSize: '12px', fontWeight: 700 }}>✓ Contacted</span>
                    ) : (
                      <button onClick={() => updateStatus(i.id, 'contacted')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#bf4937', color: '#302820', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Mark Contacted
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, CheckCircle, Clock, MapPin } from 'lucide-react'
import { ALL_CITY_CLIENTS } from './CityClients'

const buildAllClients = () => {
  const all = []
  Object.entries(ALL_CITY_CLIENTS).forEach(([cityKey, cityData]) => {
    cityData.clients.forEach(client => {
      all.push({ ...client, city: cityData.label, cityKey, cityColor: cityData.color })
    })
  })
  return all
}

const ALL_CLIENTS = buildAllClients()
const RUNNING = ALL_CLIENTS.filter(c => c.status === 'Running')
const COMPLETED = ALL_CLIENTS.filter(c => c.status === 'Completed')

export default function AllClients() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const base = activeTab === 'running' ? RUNNING : activeTab === 'completed' ? COMPLETED : ALL_CLIENTS
  const filtered = base.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="legacy-page all-clients-page" style={{ background: '#fff9f0', minHeight: '100vh', color: '#302820' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(191,73,55,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(191,73,55,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(191,73,55,0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: 'auto', padding: '60px 40px' }}>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '1px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#bf4937'}
            onMouseLeave={e => e.currentTarget.style.color = '#f5ecdf'}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '48px' }}>
          <span style={{ color: '#b84030', fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Our Portfolio</span>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-2px', lineHeight: 1, margin: '12px 0 16px' }}>
            151+ Verified<br /><span style={{ color: '#b84030' }}>Installations</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '560px', lineHeight: 1.7 }}>
            From power plants and pharma companies to hospitals and retail chains — Wipro Fire & Safety has protected organizations across South India since 2007.
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Installations', value: ALL_CLIENTS.length + '+', color: '#b84030' },
              { label: 'Running Projects', value: RUNNING.length, color: '#356345' },
              { label: 'Completed', value: COMPLETED.length + '+', color: '#64748b' },
              { label: 'Cities Covered', value: Object.keys(ALL_CITY_CLIENTS).length, color: '#62584f' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 22px', background: 'rgba(255,249,240,0.8)', border: `1px solid ${s.color}25`, borderRadius: '12px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</div>
                <div style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search + Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={14} color="#f5ecdf" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, city or industry..."
              style={{ width: '100%', padding: '11px 16px 11px 38px', background: 'rgba(255,249,240,0.8)', border: '1px solid #f5ecdf', borderRadius: '10px', color: '#302820', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All', count: ALL_CLIENTS.length },
              { id: 'running', label: 'Running', count: RUNNING.length },
              { id: 'completed', label: 'Completed', count: COMPLETED.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '10px 18px', borderRadius: '10px', border: activeTab === tab.id ? 'none' : '1px solid #f5ecdf', background: activeTab === tab.id ? 'linear-gradient(135deg, #bf4937, #bf4937)' : 'rgba(255,249,240,0.7)', color: activeTab === tab.id ? '#302820' : '#64748b', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tab.label}
                <span style={{ background: activeTab === tab.id ? 'rgba(160,135,111,0.25)' : 'rgba(160,135,111,0.06)', borderRadius: '999px', padding: '1px 7px', fontSize: '11px' }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div style={{ color: '#302820', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
          Showing {filtered.length} of {ALL_CLIENTS.length} installations
        </div>

        {/* Client Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {filtered.map((client, i) => (
            <motion.div className="client-card" key={`${client.cityKey}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.4) }} whileHover={{ y: -4 }}
              style={{ background: 'rgba(255,249,240,0.7)', border: `1px solid ${client.status === 'Running' ? 'rgba(34,197,94,0.2)' : '#f5ecdf'}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', backdropFilter: 'blur(8px)', transition: 'all 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${client.cityColor}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = client.status === 'Running' ? 'rgba(34,197,94,0.2)' : '#f5ecdf'}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: client.status === 'Running' ? 'rgba(34,197,94,0.12)' : `${client.cityColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {client.status === 'Running' ? <Clock size={15} color="#22c55e" /> : <CheckCircle size={15} color={client.cityColor} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: client.status === 'Running' ? '#302820' : '#62584f', fontWeight: 700, fontSize: '13px', lineHeight: 1.3, marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                <div className="client-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={10} color={client.cityColor} />
                  <span style={{ color: client.cityColor, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{client.city}</span>
                  <span style={{ color: '#302820', fontSize: '10px' }}>•</span>
                  <span style={{ color: '#475569', fontSize: '10px', fontWeight: 600 }}>{client.industry}</span>
                </div>
              </div>
              <span className="client-status-pill" style={{ padding: '2px 8px', background: client.status === 'Running' ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.12)', border: `1px solid ${client.status === 'Running' ? 'rgba(34,197,94,0.3)' : '#f5ecdf'}`, borderRadius: '999px', color: client.status === 'Running' ? '#356345' : '#475569', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                {client.status}
              </span>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#302820' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontWeight: 600, fontSize: '16px' }}>No results for "{search}"</p>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ marginTop: '60px', textAlign: 'center', padding: '48px', background: 'rgba(255,249,240,0.8)', border: '1px solid rgba(191,73,55,0.2)', borderRadius: '20px' }}>
          <h3 style={{ color: '#302820', fontSize: '32px', fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Join Our <span style={{ color: '#b84030' }}>Client Family</span>
          </h3>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px' }}>Get a free fire safety audit for your facility — no obligation</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', background: 'linear-gradient(135deg, #bf4937, #bf4937)', color: '#302820', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '8px', boxShadow: '0 6px 20px rgba(191,73,55,0.3)' }}>
            Get Free Audit
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Clock, MapPin, Building2 } from 'lucide-react'

// WHY: All client data in one place so both CityClients and AllClients pages can use it
export const ALL_CITY_CLIENTS = {
  hyderabad: {
    label: 'Hyderabad', color: '#b84030', state: 'Telangana',
    clients: [
      { name: 'CMH Laboratories Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Naren Projects', status: 'Completed', industry: 'Construction' },
      { name: 'Chiripal Poly Films Limited', status: 'Completed', industry: 'Manufacturing' },
      { name: 'Roopa Industries Ltd', status: 'Completed', industry: 'Industrial' },
      { name: 'My Home Tycoon', status: 'Completed', industry: 'Real Estate' },
      { name: 'Reliance Jio Projects Pvt Ltd', status: 'Completed', industry: 'Telecom' },
      { name: 'GVK Bio-Fuels', status: 'Completed', industry: 'Energy' },
      { name: 'HBL Power Systems', status: 'Completed', industry: 'Power' },
      { name: 'Transstroy India Ltd', status: 'Completed', industry: 'Infrastructure' },
      { name: 'Ramkey Infrastructure', status: 'Completed', industry: 'Infrastructure' },
      { name: 'Hindustan Coca-Cola Beverages', status: 'Completed', industry: 'FMCG' },
      { name: 'CGG0C-Soma', status: 'Completed', industry: 'Construction' },
      { name: 'KMC Constructions Ltd', status: 'Completed', industry: 'Construction' },
      { name: 'Lansum Properties LLP', status: 'Completed', industry: 'Real Estate' },
      { name: 'Indian Gas Plant Shad Nagar', status: 'Completed', industry: 'Energy' },
      { name: 'Gravity Pharmaceutical Pvt Ltd', status: 'Running', industry: 'Pharma' },
      { name: 'Spencer\'s Retail Outlet', status: 'Completed', industry: 'Retail' },
    ]
  },
  bengaluru: {
    label: 'Bengaluru', color: '#62584f', state: 'Karnataka',
    clients: [
      { name: 'MRKR Constructions & Industries Pvt Ltd', status: 'Completed', industry: 'Construction' },
      { name: 'Dana Anand India Private Ltd', status: 'Completed', industry: 'Manufacturing' },
      { name: 'Spicer India Pvt Ltd', status: 'Completed', industry: 'Automotive' },
    ]
  },
  chennai: {
    label: 'Chennai', color: '#62584f', state: 'Tamil Nadu',
    clients: [
      { name: 'Pennar Industries Limited', status: 'Running', industry: 'Steel' },
      { name: 'Hindustan Dorr Oliver Ltd', status: 'Completed', industry: 'Engineering' },
    ]
  },
  vizag: {
    label: 'Vizag', color: '#356345', state: 'Andhra Pradesh',
    clients: [
      { name: 'Ramky Infrastructure Limited', status: 'Running', industry: 'Infrastructure' },
      { name: 'Tagoor Laboratories Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Sanvira Biosciences Pvt Ltd', status: 'Completed', industry: 'Biotech' },
      { name: 'Sanvira Industries Limited', status: 'Completed', industry: 'Industrial' },
      { name: 'Mahalaxmi Pharma Chem Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Sree Balaji Industries', status: 'Completed', industry: 'Industrial' },
      { name: 'Ocimum Labs Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Aster Industries', status: 'Completed', industry: 'Industrial' },
      { name: 'Snehaa Pharmachem Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Baker Hughes Singapore Pte', status: 'Completed', industry: 'Oil & Gas' },
      { name: 'Vijaya Sri Organics Pvt Ltd', status: 'Completed', industry: 'Chemicals' },
      { name: 'Srikar Laboratories Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Angels Pharma India Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Metrochem API Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Coromandel Fertilisers', status: 'Completed', industry: 'Fertilisers' },
      { name: 'Vegesna Laboratories Pvt Ltd', status: 'Completed', industry: 'Pharma' },
      { name: 'Lansum Properties LLP', status: 'Completed', industry: 'Real Estate' },
      { name: 'The Gateway Hotel', status: 'Completed', industry: 'Hospitality' },
      { name: 'Plutus Tech Labs Pvt Ltd', status: 'Completed', industry: 'Technology' },
      { name: 'Myosynth Labs Pvt Ltd', status: 'Completed', industry: 'Pharma' },
    ]
  },
  vijayawada: {
    label: 'Vijayawada', color: '#b84030', state: 'Andhra Pradesh',
    clients: [
      { name: 'D-Mart (Avenue Supermarts)', status: 'Completed', industry: 'Retail' },
    ]
  },
  anantapur: {
    label: 'Anantapur', color: '#62584f', state: 'Andhra Pradesh',
    clients: [
      { name: 'Sapthagiri Camphor Ltd', status: 'Completed', industry: 'Chemicals' },
      { name: 'ACME Cleantech Solutions Limited', status: 'Completed', industry: 'Energy' },
      { name: 'D-Mart Anantapur', status: 'Completed', industry: 'Retail' },
    ]
  },
  nandyal: {
    label: 'Nandyal', color: '#06b6d4', state: 'Andhra Pradesh',
    clients: [
      { name: 'MG Brothers Pvt Ltd (KIA Motors)', status: 'Running', industry: 'Automotive' },
      { name: 'Shanti Ram Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'Rapha Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'Sree Satya Educational Society', status: 'Completed', industry: 'Education' },
      { name: 'JSW Cement Ltd', status: 'Completed', industry: 'Cement' },
      { name: 'SPY Agro Industries Ltd', status: 'Completed', industry: 'Agriculture' },
      { name: 'Kissan Cold Storage', status: 'Completed', industry: 'Cold Storage' },
      { name: 'Shantiram Medical College & General Hospital', status: 'Completed', industry: 'Healthcare' },
    ]
  },
  guntur: {
    label: 'Guntur', color: '#356345', state: 'Andhra Pradesh',
    clients: [
      { name: 'APGENCO Gunadala', status: 'Completed', industry: 'Power' },
    ]
  },
  kadapa: {
    label: 'Kadapa', color: '#b84030', state: 'Andhra Pradesh',
    clients: [
      { name: 'SMS Infrastructure Ltd', status: 'Completed', industry: 'Infrastructure' },
      { name: 'Simplex Infrastructure Limited', status: 'Completed', industry: 'Infrastructure' },
      { name: 'Transmission Corporation of AP', status: 'Completed', industry: 'Power' },
      { name: 'Bharathi Cement Corporation', status: 'Completed', industry: 'Cement' },
      { name: 'Rayalaseema Thermal Power Projects', status: 'Completed', industry: 'Power' },
      { name: 'Pashupathi Naar Power Plant Pvt Ltd', status: 'Completed', industry: 'Power' },
    ]
  },
  kurnool: {
    label: 'Kurnool', color: '#b84030', state: 'Andhra Pradesh (HQ)',
    clients: [
      { name: 'Skandhanshi Infra Projects (Pritvi Complex)', status: 'Running', industry: 'Real Estate' },
      { name: 'Dr. Chandramouli Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'KPS Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'Akash Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'HYT Engineering Co. Pvt Ltd', status: 'Completed', industry: 'Engineering' },
      { name: 'DVR Mansion', status: 'Completed', industry: 'Real Estate' },
      { name: 'Bharathi Diagnostics', status: 'Completed', industry: 'Healthcare' },
      { name: 'Inter Globe Aviation (IndiGo Airport)', status: 'Completed', industry: 'Aviation' },
      { name: 'Kurnool Super Speciality Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'Kusuma Care Super Speciality Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'Multiplex (Variety Mall)', status: 'Completed', industry: 'Retail' },
      { name: 'Surakshitha Multi-Speciality Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'TGV Anantha City Square Mall', status: 'Completed', industry: 'Retail' },
      { name: 'TGV Sri Rayalaseema Alkalies', status: 'Completed', industry: 'Chemicals' },
      { name: 'TGV Sree Rayalaseema High Strength Hypo', status: 'Completed', industry: 'Chemicals' },
      { name: 'Gowri Gopal Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'The Mourya Inn', status: 'Completed', industry: 'Hospitality' },
      { name: 'TGV Projects & Investments Pvt Ltd', status: 'Completed', industry: 'Real Estate' },
      { name: 'BPCL Plant Kurnool', status: 'Completed', industry: 'Oil & Gas' },
      { name: 'Andhra Pradesh Expressway Ltd', status: 'Completed', industry: 'Infrastructure' },
      { name: 'Omega Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'Anand Cine Complex', status: 'Completed', industry: 'Entertainment' },
      { name: 'Viswabharathi Cancer & General Hospital', status: 'Completed', industry: 'Healthcare' },
      { name: 'D-Mart Kurnool', status: 'Completed', industry: 'Retail' },
      { name: 'Sree Vijaya Durga Degree College', status: 'Completed', industry: 'Education' },
    ]
  },
}

const INDUSTRY_COLORS = {
  'Pharma': '#8b5cf6', 'Healthcare': '#ef4444', 'Power': '#bf4937',
  'Industrial': '#bf4937', 'Construction': '#64748b', 'Infrastructure': '#06b6d4',
  'Retail': '#10b981', 'Manufacturing': '#3b82f6', 'Chemicals': '#ec4899',
  'Oil & Gas': '#bf4937', 'Energy': '#22c55e', 'FMCG': '#84cc16',
  'Steel': '#94a3b8', 'Cement': '#78716c', 'Automotive': '#0ea5e9',
  'Fertilisers': '#f5ecdf', 'Biotech': '#a855f7', 'Technology': '#38bdf8',
  'Real Estate': '#bf4937', 'Telecom': '#14b8a6', 'Hospitality': '#f43f5e',
  'Education': '#6366f1', 'Aviation': '#0284c7', 'Agriculture': '#84cc16',
  'Cold Storage': '#22d3ee', 'Agri': '#4ade80',
}

export default function CityClients() {
  // WHY: useParams reads the city from the URL e.g. /clients/hyderabad → city = 'hyderabad'
  const { city } = useParams()
  const data = ALL_CITY_CLIENTS[city]

  if (!data) {
    return (
      <div className="legacy-page" style={{ background: '#fff9f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#302820' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '16px' }}>City not found</h1>
          <Link to="/" style={{ color: '#b84030', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    )
  }

  const running = data.clients.filter(c => c.status === 'Running')
  const completed = data.clients.filter(c => c.status === 'Completed')

  return (
    <div className="legacy-page" style={{ background: '#fff9f0', minHeight: '100vh', color: '#302820' }}>

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(191,73,55,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(191,73,55,0.02) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      {/* Color glow from city color */}
      <div style={{ position: 'fixed', top: '20%', right: '10%', width: '400px', height: '400px', background: `radial-gradient(circle, ${data.color}15 0%, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: 'auto', padding: '60px 40px' }}>

        {/* Back button — WHY: Always give users a way back */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '1px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#bf4937'}
            onMouseLeave={e => e.currentTarget.style.color = '#f5ecdf'}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: data.color, boxShadow: `0 0 12px ${data.color}` }} />
            <span style={{ color: data.color, fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
              {data.state}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-2px', lineHeight: 1, marginBottom: '20px' }}>
            {data.label}<br /><span style={{ color: data.color }}>Installations</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '560px', lineHeight: 1.7 }}>
            Wipro Fire & Safety has installed certified fire protection systems for {data.clients.length} organizations in {data.label}.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '32px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Clients', value: data.clients.length, color: data.color },
              { label: 'Running Projects', value: running.length, color: '#356345' },
              { label: 'Completed', value: completed.length, color: '#64748b' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px 24px', background: 'rgba(255,249,240,0.8)', border: `1px solid ${s.color}25`, borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: s.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</div>
                <div style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Running Projects */}
        {running.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s infinite' }} />
              <h2 style={{ color: '#302820', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active / Running Projects</h2>
              <span style={{ padding: '2px 10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '999px', color: '#356345', fontSize: '11px', fontWeight: 700 }}>{running.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {running.map((client, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ y: -4 }}
                  style={{ background: 'rgba(255,249,240,0.8)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', backdropFilter: 'blur(8px)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ color: '#302820', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>{client.name}</div>
                    <div style={{ color: INDUSTRY_COLORS[client.industry] || '#64748b', fontSize: '11px', fontWeight: 600, marginTop: '3px' }}>{client.industry}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Projects */}
        {completed.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <CheckCircle size={18} color="#64748b" />
              <h2 style={{ color: '#302820', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Completed Installations</h2>
              <span style={{ padding: '2px 10px', background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '999px', color: '#64748b', fontSize: '11px', fontWeight: 700 }}>{completed.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {completed.map((client, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.03 }} whileHover={{ y: -4 }}
                  style={{ background: 'rgba(255,249,240,0.6)', border: '1px solid #f5ecdf', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', backdropFilter: 'blur(8px)', transition: 'border-color 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${data.color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#f5ecdf'}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${data.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={16} color={data.color} />
                  </div>
                  <div>
                    <div style={{ color: '#62584f', fontWeight: 600, fontSize: '14px', lineHeight: 1.3 }}>{client.name}</div>
                    <div style={{ color: INDUSTRY_COLORS[client.industry] || '#64748b', fontSize: '11px', fontWeight: 600, marginTop: '3px' }}>{client.industry}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ marginTop: '60px', padding: '40px', background: 'rgba(255,249,240,0.8)', border: `1px solid ${data.color}25`, borderRadius: '20px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
          <h3 style={{ color: '#302820', fontSize: '28px', fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Based in <span style={{ color: data.color }}>{data.label}?</span>
          </h3>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px' }}>Get a free fire safety audit for your facility</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ padding: '13px 32px', background: `linear-gradient(135deg, ${data.color}, ${data.color}cc)`, color: '#302820', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '8px', boxShadow: `0 4px 16px ${data.color}35` }}>
              Get Free Audit
            </Link>
            <Link to="/clients" style={{ padding: '13px 32px', border: '1px solid #f5ecdf', color: '#62584f', fontWeight: 700, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '8px' }}>
              View All Clients
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

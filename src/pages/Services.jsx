import { motion } from 'framer-motion'
import { Wrench, ClipboardCheck, RefreshCw, Search, GraduationCap, ArrowRight, Flame, CheckCircle, Phone, AlertTriangle, ShoppingBag, Factory, Hospital, School, Building2, Warehouse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

function FireParticles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    const particles = []
    for (let i = 0; i < 45; i++) {
      particles.push({ x: Math.random() * canvas.width, y: canvas.height + Math.random() * 200, vx: (Math.random() - 0.5) * 0.8, vy: -(Math.random() * 1.5 + 0.5), size: Math.random() * 3 + 1, opacity: Math.random() * 0.4 + 0.1, hue: Math.random() * 40 + 10 })
    }
    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.opacity -= 0.002
        if (p.y < -10 || p.opacity <= 0) { p.x = Math.random() * canvas.width; p.y = canvas.height + 10; p.opacity = Math.random() * 0.4 + 0.1; p.vy = -(Math.random() * 1.5 + 0.5); p.vx = (Math.random() - 0.5) * 0.8 }
        ctx.save(); ctx.globalAlpha = p.opacity; ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`; ctx.shadowBlur = 8; ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.4 }} />
}

const services = [
  { icon: Wrench, title: 'Installation Services', description: 'Professional installation of fire alarm systems, hydrants, extinguishers, and emergency equipment. From site survey to final commissioning — we handle everything.', tag: 'Most Popular', features: ['Site survey & planning', 'Professional installation', 'Testing & commissioning', 'Compliance certification'], color: '#f97316' },
  { icon: ClipboardCheck, title: 'Annual Maintenance (AMC)', description: 'Regular inspection, servicing, and testing of all safety equipment. Scheduled visits with detailed service reports and priority emergency support.', tag: 'Recommended', features: ['Quarterly inspections', 'Equipment servicing', 'Compliance reports', 'Priority support'], color: '#eab308' },
  { icon: RefreshCw, title: 'Refilling & Testing', description: 'Fire extinguisher refilling, pressure testing, and certification using certified agents following IS standards.', tag: null, features: ['IS certified agents', 'Pressure testing', 'Refill certification', 'Quick turnaround'], color: '#f97316' },
  { icon: Search, title: 'Safety Audits & Consulting', description: 'Site inspection, risk analysis, and guidance on fire safety compliance. First audit is FREE with detailed action plan report.', tag: 'Free First Audit', features: ['Risk assessment', 'Compliance gap analysis', 'Detailed report', 'Action plan'], color: '#22c55e' },
  { icon: GraduationCap, title: 'Safety Training', description: 'Hands-on fire safety training for employees covering extinguisher operation, evacuation procedures, and emergency response. Certificate issued.', tag: null, features: ['Hands-on training', 'Evacuation drills', 'Certificate issued', 'Custom programs'], color: '#eab308' },
]

const industries = [
  { icon: ShoppingBag, name: 'Malls & Retail', tip: 'High footfall requires addressable alarm systems and multiple extinguisher zones.', color: '#f97316' },
  { icon: Factory, name: 'Factories', tip: 'Industrial risks need CO2 and dry powder systems plus regular staff training.', color: '#eab308' },
  { icon: Hospital, name: 'Hospitals', tip: 'Healthcare facilities need clean agent systems to protect sensitive medical equipment.', color: '#22c55e' },
  { icon: School, name: 'Schools', tip: 'Educational institutions need clear evacuation routes and regular fire drills.', color: '#f97316' },
  { icon: Building2, name: 'Offices', tip: 'Office buildings need zoned alarm systems and strategically placed extinguishers.', color: '#eab308' },
  { icon: Warehouse, name: 'Warehouses', tip: 'Large storage spaces require sprinkler systems and hydrant networks.', color: '#f97316' },
]

const emergency = [
  'Do NOT use water on electrical or oil fires',
  'Pull the pin, aim at base, squeeze, sweep (P.A.S.S.)',
  'Evacuate if fire is larger than a wastepaper basket',
  'Close doors behind you — slows fire spread',
  'Call 101 (Fire) immediately — do not wait',
  'Meet at designated assembly point outside',
  'Never use elevator during fire evacuation',
  'Account for all persons before fire brigade arrives',
]

export default function Services() {
  return (
    <div className="legacy-page" style={{ background: '#020617', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <img
          src="https://images.unsplash.com/photo-1698533188601-2432adf826f4?w=1920&q=60"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.06 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.75) 50%, rgba(2,6,23,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <FireParticles />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* HERO */}
        <section style={{ padding: '80px 40px 40px', maxWidth: '1100px', margin: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '999px', marginBottom: '24px' }}>
              <Flame size={14} color="#f97316" />
              <span style={{ color: '#f97316', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>What We Do</span>
            </motion.div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, color: 'white', lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '-2px', marginBottom: '20px' }}>
              Our <span style={{ color: '#f97316' }}>Services</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: 1.8, maxWidth: '600px' }}>
              End-to-end fire safety services for commercial, industrial, and institutional clients. First safety audit is always FREE.
            </p>
          </motion.div>
        </section>

        {/* SERVICES LIST */}
        <section style={{ padding: '20px 40px 60px', maxWidth: '1100px', margin: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {services.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ x: 6 }} style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(12px)', border: '1px solid #1e293b', borderLeft: `4px solid ${s.color}`, borderRadius: '16px', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle, ${s.color}06 0%, transparent 70%)` }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={24} color={s.color} />
                      </motion.div>
                      <div>
                        <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{s.title}</h3>
                        {s.tag && <span style={{ padding: '3px 10px', borderRadius: '999px', background: `${s.color}20`, color: s.color, fontSize: '11px', fontWeight: 700 }}>{s.tag}</span>}
                      </div>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.8 }}>{s.description}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {s.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={14} color={s.color} style={{ flexShrink: 0 }} />
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* INDUSTRY SOLUTIONS */}
        <section style={{ padding: '80px 40px', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(10px)', borderTop: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '1100px', margin: 'auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '48px' }}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>
                Solutions By <span style={{ color: '#f97316' }}>Industry</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '16px' }}>Tailored fire safety recommendations for your specific sector</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {industries.map((ind, i) => {
                const Icon = ind.icon
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -8, borderColor: `${ind.color}40` }} style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', transition: 'all 0.3s' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${ind.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Icon size={24} color={ind.color} />
                    </div>
                    <h3 style={{ color: 'white', fontWeight: 800, fontSize: '18px', marginBottom: '10px' }}>{ind.name}</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>{ind.tip}</p>
                    <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: ind.color, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                      Get solution <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* EMERGENCY CHECKLIST */}
        <section style={{ padding: '80px 40px', background: 'rgba(220,38,38,0.04)', borderTop: '1px solid rgba(220,38,38,0.15)' }}>
          <div style={{ maxWidth: '1100px', margin: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <AlertTriangle size={28} color="#ef4444" />
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '44px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                    Emergency <span style={{ color: '#ef4444' }}>Checklist</span>
                  </h2>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.8, marginBottom: '24px' }}>
                  Print and display this checklist in your facility. Every employee should know these steps.
                </p>
                <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', borderRadius: '10px' }}>
                  <Phone size={16} /> Get Training Now
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '18px' }}>🚨</span>
                    <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>In Case of Fire — Do This</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {emergency.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                        <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid #1e293b', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '30px', left: '30px', width: '50px', height: '50px', borderTop: '2px solid rgba(249,115,22,0.3)', borderLeft: '2px solid rgba(249,115,22,0.3)' }} />
          <div style={{ position: 'absolute', bottom: '30px', right: '30px', width: '50px', height: '50px', borderBottom: '2px solid rgba(249,115,22,0.3)', borderRight: '2px solid rgba(249,115,22,0.3)' }} />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 900, color: 'white', textTransform: 'uppercase', marginBottom: '12px' }}>
              Need a <span style={{ color: '#f97316' }}>Custom Quote?</span>
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>Contact us — our team responds within 24 hours</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #ea580c, #f97316)', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block' }}>Get Free Quote</Link>
              <Link to="/products" style={{ padding: '14px 36px', border: '2px solid #334155', color: '#e2e8f0', fontWeight: 700, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block' }}>View Products</Link>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  )
}
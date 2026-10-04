import { motion } from 'framer-motion'
import { Shield, Award, CheckCircle, Users, Clock, MapPin, ArrowRight, Flame, Phone } from 'lucide-react'
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
    for (let i = 0; i < 55; i++) {
      particles.push({ x: Math.random() * canvas.width, y: canvas.height + Math.random() * 200, vx: (Math.random() - 0.5) * 0.8, vy: -(Math.random() * 1.5 + 0.5), size: Math.random() * 3 + 1, opacity: Math.random() * 0.5 + 0.1, hue: Math.random() * 40 + 10 })
    }
    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.opacity -= 0.002
        if (p.y < -10 || p.opacity <= 0) { p.x = Math.random() * canvas.width; p.y = canvas.height + 10; p.opacity = Math.random() * 0.5 + 0.1; p.vy = -(Math.random() * 1.5 + 0.5); p.vx = (Math.random() - 0.5) * 0.8 }
        ctx.save(); ctx.globalAlpha = p.opacity; ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`; ctx.shadowBlur = 8; ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.45 }} />
}

const reasons = [
  { icon: Clock, text: 'Serving since 2007 — 18+ years', color: '#b84030' },
  { icon: Award, text: 'GST Registered & ISO certified', color: '#b84030' },
  { icon: Shield, text: 'Fire Department approved', color: '#b84030' },
  { icon: Users, text: 'Expert technical team on ground', color: '#b84030' },
  { icon: CheckCircle, text: 'Trusted by 1000+ clients', color: '#b84030' },
  { icon: MapPin, text: 'Serving across South India', color: '#b84030' },
]

const stats = [
  { value: '18+', label: 'Years Experience' },
  { value: '1000+', label: 'Happy Clients' },
  { value: '100%', label: 'Compliance Rate' },
  { value: '24/7', label: 'Support Available' },
]

const timeline = [
  { year: '2007', title: 'Founded', desc: 'Wipro Fire & Safety established in Kurnool by V. Ramanjaneyulu with a vision to make South India safer.' },
  { year: '2010', title: 'ISO Certified', desc: 'Achieved ISO certification for fire safety products and installation services.' },
  { year: '2015', title: '500+ Clients', desc: 'Crossed 500 satisfied clients across Kurnool and Andhra Pradesh.' },
  { year: '2020', title: 'South India Expansion', desc: 'Expanded services to Hyderabad, Bengaluru, Chennai, Vizag, Vijayawada and all major South Indian cities.' },
  { year: '2024', title: '1000+ Clients', desc: 'Now serving 1000+ clients across South India with 24/7 emergency support.' },
]

const process = [
  { step: '01', icon: '🔍', title: 'Site Survey', desc: 'FREE comprehensive fire risk assessment and compliance gap analysis at your facility.' },
  { step: '02', icon: '📋', title: 'Custom Plan', desc: 'Customized fire safety plan based on your facility size, industry type, and regulations.' },
  { step: '03', icon: '🔧', title: 'Installation', desc: 'Certified technicians install all equipment to IS standards with zero disruption.' },
  { step: '04', icon: '✅', title: 'Certification', desc: 'Full compliance certification, fire department approval, and staff training.' },
  { step: '05', icon: '🔄', title: 'AMC Support', desc: 'Annual Maintenance Contract keeps your equipment compliant 365 days a year.' },
]

const southIndiaCities = [
  { city: 'Kurnool', tag: 'HQ' },
  { city: 'Hyderabad', tag: 'Major' },
  { city: 'Bengaluru', tag: 'Major' },
  { city: 'Chennai', tag: 'Major' },
  { city: 'Vizag', tag: 'Major' },
  { city: 'Vijayawada', tag: 'Major' },
  { city: 'Nandyal', tag: null },
  { city: 'Kadapa', tag: null },
  { city: 'Anantapur', tag: null },
  { city: 'Guntur', tag: null },
  { city: 'Tirupati', tag: null },
  { city: 'Coimbatore', tag: null },
  { city: 'Madurai', tag: null },
  { city: 'Mangalore', tag: null },
]

export default function About() {
  return (
    <div className="legacy-page" style={{ background: '#fff9f0', minHeight: '100vh', color: '#302820', overflow: 'hidden' }}>

      {/* Background: Unsplash industrial image + overlay + grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=60"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.08 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,249,240,0.9) 0%, rgba(255,249,240,0.7) 40%, rgba(255,249,240,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(191,73,55,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(191,73,55,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(191,73,55,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(191,73,55,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>



      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* HERO */}
        <section style={{ padding: '80px 40px 60px', maxWidth: '1100px', margin: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(191,73,55,0.15)', border: '1px solid rgba(191,73,55,0.3)', borderRadius: '999px', marginBottom: '24px' }}>
              <Flame size={14} color="#bf4937" />
              <span style={{ color: '#b84030', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Est. 2007 — South India</span>
            </motion.div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, color: '#302820', lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '-2px', marginBottom: '24px' }}>
              South India's<br /><span style={{ color: '#b84030' }}>Trusted Fire Safety</span><br />Partner
            </h1>
            <p style={{ color: '#62584f', fontSize: '18px', lineHeight: 1.8, maxWidth: '650px', marginBottom: '40px' }}>
              Founded in 2007 by <strong style={{ color: '#302820' }}>V. Ramanjaneyulu</strong>, Wipro Fire & Safety has grown from Kurnool into one of South India's most trusted fire protection companies — serving 1000+ clients across AP, Telangana, Karnataka, Tamil Nadu and beyond.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'linear-gradient(135deg, #bf4937, #bf4937)', color: '#302820', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                Get Free Audit <ArrowRight size={16} />
              </Link>
              <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', border: '2px solid #f5ecdf', color: '#62584f', fontWeight: 700, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                Our Services <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* STATS BAR */}
        <section className="about-stats" style={{ borderTop: '1px solid #f5ecdf', borderBottom: '1px solid #f5ecdf', background: 'rgba(255,249,240,0.7)', backdropFilter: 'blur(10px)', padding: '40px' }}>
          <div style={{ maxWidth: '1100px', margin: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 900, color: '#b84030' }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW WE WORK */}
        <section style={{ padding: '80px 40px', maxWidth: '1100px', margin: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #bf4937, #bf4937)', margin: '0 auto 16px' }} />
            <span style={{ color: '#b84030', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Our Process</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>
              How We <span style={{ color: '#b84030' }}>Work</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>From first call to full certification — 5 steps, zero compromise</p>
          </motion.div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, #bf4937, #bf4937, #bf4937)', opacity: 0.2 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {process.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} whileHover={{ y: -8 }} style={{ background: 'rgba(255,249,240,0.8)', backdropFilter: 'blur(10px)', border: '1px solid #f5ecdf', borderRadius: '16px', padding: '24px 16px', textAlign: 'center', position: 'relative', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #bf4937, #bf4937)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#302820', border: '3px solid #fff9f0' }}>{p.step}</div>

                  <h3 style={{ color: '#302820', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>{p.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section style={{ padding: '40px 40px 60px', maxWidth: '1100px', margin: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '44px', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '24px' }}>
                Our <span style={{ color: '#b84030' }}>Mission</span>
              </h2>
              <p style={{ color: '#62584f', fontSize: '16px', lineHeight: 1.9, marginBottom: '20px' }}>
                We specialize in supplying, installing, and maintaining high-quality fire safety systems for malls, factories, hospitals, offices and all commercial spaces across South India.
              </p>
              <p style={{ color: '#62584f', fontSize: '16px', lineHeight: 1.9, marginBottom: '28px' }}>
                GST registered with Fire Department approved products — our mission is to protect life and property through reliable, affordable, and fully compliant safety solutions.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="tel:+918019918288" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #bf4937, #bf4937)', color: '#302820', fontWeight: 700, textDecoration: 'none', fontSize: '14px', borderRadius: '10px' }}>
                  <Phone size={16} /> Call Now
                </a>
                <a href="https://wa.me/918019918288" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#356345', fontWeight: 700, textDecoration: 'none', fontSize: '14px', borderRadius: '10px' }}>
                  💬 WhatsApp
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {reasons.map((r, i) => {
                const Icon = r.icon
                return (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} style={{ background: 'rgba(255,249,240,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #f5ecdf', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'all 0.3s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${r.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={r.color} />
                    </div>
                    <span style={{ color: '#62584f', fontSize: '12px', lineHeight: 1.5 }}>{r.text}</span>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* SOUTH INDIA COVERAGE */}
        <section style={{ padding: '80px 40px', background: 'rgba(255,249,240,0.6)', backdropFilter: 'blur(10px)', borderTop: '1px solid #f5ecdf' }}>
          <div style={{ maxWidth: '1100px', margin: 'auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '48px' }}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #bf4937, #bf4937)', margin: '0 auto 16px' }} />
              <span style={{ color: '#b84030', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Coverage</span>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>
                We Serve All <span style={{ color: '#b84030' }}>South India</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>From our base in Kurnool, we serve clients across all major cities in South India</p>
            </motion.div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
              {southIndiaCities.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.08, y: -4 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: c.tag === 'HQ' ? 'linear-gradient(135deg, rgba(191,73,55,0.3), rgba(191,73,55,0.1))' : c.tag === 'Major' ? 'rgba(191,73,55,0.1)' : 'rgba(255,249,240,0.8)', border: c.tag === 'HQ' ? '1px solid rgba(191,73,55,0.6)' : c.tag === 'Major' ? '1px solid rgba(191,73,55,0.3)' : '1px solid #f5ecdf', borderRadius: '999px', cursor: 'default', transition: 'all 0.3s' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.tag === 'HQ' ? '#bf4937' : c.tag === 'Major' ? '#bf4937' : '#f5ecdf' }} />
                  <span style={{ color: c.tag === 'HQ' ? '#b84030' : c.tag === 'Major' ? '#b84030' : '#62584f', fontWeight: c.tag ? 700 : 500, fontSize: '14px' }}>{c.city}</span>
                  {c.tag === 'HQ' && <span style={{ fontSize: '10px', background: '#bf4937', color: '#302820', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>HQ</span>}
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {[{ color: '#b84030', label: 'Headquarters' }, { color: '#b84030', label: 'Major City Operations' }, { color: '#302820', label: 'Service Coverage' }].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="journey-section" style={{ padding: '80px 40px', borderTop: '1px solid #f5ecdf' }}>
          <div style={{ maxWidth: '900px', margin: 'auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '60px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #bf4937, #bf4937)', margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-1px' }}>Our <span style={{ color: '#b84030' }}>Journey</span></h2>
            </motion.div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, #bf4937, transparent)', transform: 'translateX(-50%)' }} />
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', marginBottom: '40px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '50%', top: '20px', width: '12px', height: '12px', borderRadius: '50%', background: '#bf4937', border: '3px solid #fff9f0', transform: 'translateX(-50%)', boxShadow: '0 0 12px rgba(191,73,55,0.6)' }} />
                  <div className="journey-card" style={{ width: '44%', background: 'rgba(255,249,240,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #f5ecdf', borderRadius: '12px', padding: '20px 24px' }}>
                    <div style={{ color: '#b84030', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', marginBottom: '6px' }}>{item.year}</div>
                    <div style={{ color: '#302820', fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid #f5ecdf', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '40px', left: '40px', width: '50px', height: '50px', borderTop: '2px solid rgba(191,73,55,0.3)', borderLeft: '2px solid rgba(191,73,55,0.3)' }} />
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '50px', height: '50px', borderBottom: '2px solid rgba(191,73,55,0.3)', borderRight: '2px solid rgba(191,73,55,0.3)' }} />
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '48px', fontWeight: 900, color: '#302820', textTransform: 'uppercase', marginBottom: '16px' }}>
              Ready to <span style={{ color: '#b84030' }}>Work Together?</span>
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>Get a free safety audit — serving all of South India</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #bf4937, #bf4937)', color: '#302820', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block' }}>Contact Us</Link>
              <Link to="/products" style={{ padding: '14px 36px', border: '2px solid #f5ecdf', color: '#62584f', fontWeight: 700, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block' }}>View Products</Link>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  )
}

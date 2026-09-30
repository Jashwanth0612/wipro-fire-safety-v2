import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Award, Building2, Factory, Hospital, School, ShoppingBag, Warehouse, CheckCircle, ArrowRight, Flame, Zap, Star, ChevronDown, Quote } from 'lucide-react'

// ── WHY: Real big brand client names from the PDF build instant trust
// Two rows so we can scroll them in opposite directions — premium effect
const clientsRow1 = [
  'D-Mart (Avenue Supermarts)', 'IndiGo Airport Kurnool', 'Indian Oil Corporation',
  'HPCL Guntakal', 'BPCL Kurnool', 'Reliance Jio Projects',
  'JSW Cement', 'Amara Raja Battery', 'Hindustan Coca-Cola',
  'APGENCO', 'South Central Railway', 'Baker Hughes',
  'Pennar Industries', 'HBL Power Systems', 'Kirloskar Ferrous',
  'Ultra Tech Cement', 'Sandur Manganese', 'Kalyani Steels',
]
const clientsRow2 = [
  'KMC Hospital', 'Omega Hospital', 'Shanti Ram Hospital',
  'Viswabharathi Cancer Hospital', 'Tagoor Laboratories', 'Aurobindo Pharma',
  'Ramky Infrastructure', 'KMC Constructions', 'Soma Enterprises',
  'Lanco Infratech', 'Transstroy India', 'BMM Ispat',
  'Syngenta India', 'Coromandel Fertilisers', 'Pearl Beverages',
  "Spencer's Retail", 'Thermal Power Corporation', 'Krishnapatnam Port',
]

// ── WHY: City-wise client data from the PDF
// When user clicks a city on the orbital, we navigate to /clients/:city
// This makes the orbital interactive and adds real business value
const CITY_CLIENTS = {
  hyderabad: {
    label: 'Hyderabad',
    color: '#f97316',
    clients: [
      { name: 'CMH Laboratories Pvt Ltd', status: 'Completed' },
      { name: 'Naren Projects', status: 'Completed' },
      { name: 'Chiripal Poly Films Limited', status: 'Completed' },
      { name: 'Roopa Industries Ltd', status: 'Completed' },
      { name: 'My Home Tycoon', status: 'Completed' },
      { name: 'Reliance Jio Projects Pvt Ltd', status: 'Completed' },
      { name: 'GVK Bio-Fuels', status: 'Completed' },
      { name: 'HBL Power Systems', status: 'Completed' },
      { name: 'Transstroy India Ltd', status: 'Completed' },
      { name: 'Ramkey Infrastructure', status: 'Completed' },
      { name: 'Hindustan Coca-Cola Beverages', status: 'Completed' },
      { name: 'CGG0C-Soma', status: 'Completed' },
      { name: 'KMC Constructions Ltd', status: 'Completed' },
      { name: 'Lansum Properties LLP', status: 'Completed' },
      { name: 'Indian Gas Plant Shad Nagar', status: 'Completed' },
      { name: 'Gravity Pharmaceutical Pvt Ltd', status: 'Running' },
    ]
  },
  bengaluru: {
    label: 'Bengaluru',
    color: '#3b82f6',
    clients: [
      { name: 'MRKR Constructions & Industries Pvt Ltd', status: 'Completed' },
      { name: 'Dana Anand India Private Ltd', status: 'Completed' },
      { name: 'Spicer India Pvt Ltd', status: 'Completed' },
    ]
  },
  chennai: {
    label: 'Chennai',
    color: '#8b5cf6',
    clients: [
      { name: 'Pennar Industries Limited', status: 'Running' },
      { name: 'Hindustan Dorr Oliver Ltd', status: 'Completed' },
    ]
  },
  vizag: {
    label: 'Vizag',
    color: '#10b981',
    clients: [
      { name: 'Ramky Infrastructure Limited', status: 'Running' },
      { name: 'Tagoor Laboratories Pvt Ltd', status: 'Completed' },
      { name: 'Sanvira Biosciences Pvt Ltd', status: 'Completed' },
      { name: 'Sanvira Industries Limited', status: 'Completed' },
      { name: 'Mahalaxmi Pharma Chem Pvt Ltd', status: 'Completed' },
      { name: 'Sree Balaji Industries', status: 'Completed' },
      { name: 'Ocimum Labs Pvt Ltd', status: 'Completed' },
      { name: 'Aster Industries', status: 'Completed' },
      { name: 'Snehaa Pharmachem Pvt Ltd', status: 'Completed' },
      { name: 'Baker Hughes Singapore', status: 'Completed' },
      { name: 'Vijaya Sri Organics Pvt Ltd', status: 'Completed' },
      { name: 'Srikar Laboratories Pvt Ltd', status: 'Completed' },
      { name: 'Angels Pharma India Pvt Ltd', status: 'Completed' },
      { name: 'Metrochem API Pvt Ltd', status: 'Completed' },
      { name: 'Coromandel Fertilisers', status: 'Completed' },
      { name: 'Vegesna Laboratories Pvt Ltd', status: 'Completed' },
      { name: 'Lansum Properties LLP', status: 'Completed' },
      { name: 'The Gateway Hotel', status: 'Completed' },
      { name: 'Plutus Tech Labs Pvt Ltd', status: 'Completed' },
      { name: 'Myosynth Labs Pvt Ltd', status: 'Completed' },
    ]
  },
  vijayawada: {
    label: 'Vijayawada',
    color: '#f59e0b',
    clients: [
      { name: 'D-Mart (Avenue Supermarts)', status: 'Completed' },
    ]
  },
  anantapur: {
    label: 'Anantapur',
    color: '#ec4899',
    clients: [
      { name: 'Sapthagiri Camphor Ltd', status: 'Completed' },
      { name: 'ACME Cleantech Solutions Limited', status: 'Completed' },
      { name: 'D-Mart Anantapur', status: 'Completed' },
    ]
  },
  nandyal: {
    label: 'Nandyal',
    color: '#06b6d4',
    clients: [
      { name: 'MG Brothers Pvt Ltd (KIA Motors)', status: 'Running' },
      { name: 'Shanti Ram Hospital', status: 'Completed' },
      { name: 'Rapha Hospital', status: 'Completed' },
      { name: 'Sree Satya Educational Society', status: 'Completed' },
      { name: 'JSW Cement Ltd', status: 'Completed' },
      { name: 'SPY Agro Industries Ltd', status: 'Completed' },
      { name: 'Kissan Cold Storage', status: 'Completed' },
      { name: 'Shantiram Medical College & General Hospital', status: 'Completed' },
    ]
  },
  guntur: {
    label: 'Guntur',
    color: '#84cc16',
    clients: [
      { name: 'APGENCO Gunadala', status: 'Completed' },
    ]
  },
  kadapa: {
    label: 'Kadapa',
    color: '#fb923c',
    clients: [
      { name: 'SMS Infrastructure Ltd', status: 'Completed' },
      { name: 'Simplex Infrastructure Limited', status: 'Completed' },
      { name: 'Transmission Corporation of AP', status: 'Completed' },
      { name: 'Bharathi Cement Corporation', status: 'Completed' },
      { name: 'Rayalaseema Thermal Power Projects', status: 'Completed' },
      { name: 'Pashupathi Naar Power Plant', status: 'Completed' },
    ]
  },
}

// ── ORBITAL: Now clickable cities with Kurnool HQ in center
// WHY: Interactive orbital makes the website feel alive and data-rich
// Clicking a city shows real clients from that city — adds business credibility
const OrbitalReach = () => {
  const [rotX, setRotX] = useState(15)
  const [rotY, setRotY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hoveredNode, setHoveredNode] = useState(null)
  const lastPos = useRef({ x: 0, y: 0 })
  const animRef = useRef(null)
  const autoRotY = useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!dragging && hoveredNode === null) {
      const tick = () => {
        autoRotY.current += 0.25
        setRotY(autoRotY.current)
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [dragging, hoveredNode])

  const onDown = (e) => { setDragging(true); lastPos.current = { x: e.clientX, y: e.clientY }; cancelAnimationFrame(animRef.current) }
  const onMove = (e) => {
    if (!dragging) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    setRotY(r => { autoRotY.current = r + dx * 0.4; return r + dx * 0.4 })
    setRotX(r => Math.max(-60, Math.min(60, r - dy * 0.3)))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const onUp = () => setDragging(false)

  const nodes = [
    { key: 'hyderabad',  name: 'Hyderabad',  color: '#f97316', orbit: 148, angle: 0 },
    { key: 'bengaluru',  name: 'Bengaluru',  color: '#3b82f6', orbit: 148, angle: 120 },
    { key: 'chennai',    name: 'Chennai',    color: '#8b5cf6', orbit: 148, angle: 240 },
    { key: 'vizag',      name: 'Vizag',      color: '#10b981', orbit: 105, angle: 60 },
    { key: 'vijayawada', name: 'Vijayawada', color: '#f59e0b', orbit: 105, angle: 195 },
    { key: 'anantapur',  name: 'Anantapur',  color: '#ec4899', orbit: 105, angle: 315 },
    { key: 'nandyal',    name: 'Nandyal',    color: '#06b6d4', orbit: 64,  angle: 30 },
    { key: 'guntur',     name: 'Guntur',     color: '#84cc16', orbit: 64,  angle: 165 },
    { key: 'kadapa',     name: 'Kadapa',     color: '#fb923c', orbit: 64,  angle: 285 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div
        style={{ width: 380, height: 380, position: 'relative', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      >
        <div style={{ width: '100%', height: '100%', perspective: '1000px' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`, transition: dragging ? 'none' : 'transform 0.1s ease-out' }}>

            {/* Orbit rings — WHY: thicker, glowing rings look more premium */}
            {[148, 105, 64].map((r, i) => (
              <div key={i} style={{ position: 'absolute', top: `calc(50% - ${r}px)`, left: `calc(50% - ${r}px)`, width: r * 2, height: r * 2, borderRadius: '50%', border: `1px solid rgba(249,115,22,${0.15 + i * 0.05})`, transformStyle: 'preserve-3d', boxShadow: `0 0 ${8 + i * 4}px rgba(249,115,22,0.05)` }} />
            ))}

            {/* Center — KURNOOL HQ clickable — fixed click detection */}
            <div
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}
              onMouseEnter={() => { setHoveredNode('kurnool'); cancelAnimationFrame(animRef.current) }}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => navigate('/clients/kurnool')}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: hoveredNode === 'kurnool'
                  ? '0 0 60px rgba(249,115,22,0.9), 0 0 100px rgba(249,115,22,0.4)'
                  : '0 0 40px rgba(249,115,22,0.6), 0 0 80px rgba(249,115,22,0.2)',
                border: '2px solid rgba(249,115,22,0.5)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s'
              }}>
                <Shield style={{ color: 'white', width: 22, height: 22, pointerEvents: 'none' }} />
                <span style={{ color: 'white', fontSize: '7px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px', pointerEvents: 'none' }}>KURNOOL</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '6px', fontWeight: 700, letterSpacing: '0.5px', pointerEvents: 'none' }}>HQ</span>
              </div>
            </div>

            {/* City nodes — clickable */}
            {nodes.map((n, i) => {
              const theta = (n.angle * Math.PI) / 180
              const x = n.orbit * Math.cos(theta)
              const z = n.orbit * Math.sin(theta)
              const isHovered = hoveredNode === n.name
              const clientCount = CITY_CLIENTS[n.key]?.clients.length || 0
              return (
                <div key={i}
                  onMouseEnter={() => setHoveredNode(n.name)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); navigate(`/clients/${n.key}`) }}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px)`, background: isHovered ? n.color : 'rgba(15,23,42,0.95)', border: `1px solid ${n.color}`, borderRadius: '999px', padding: '5px 14px', fontSize: '10px', fontWeight: 800, color: isHovered ? 'white' : n.color, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: isHovered ? `0 0 20px ${n.color}, 0 0 40px ${n.color}40` : `0 0 8px ${n.color}30`, transition: 'all 0.3s ease-out', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {n.name}
                  {/* WHY: Show client count on hover so user knows clicking gives real data */}
                  {isHovered && clientCount > 0 && (
                    <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '1px 6px', fontSize: '9px', fontWeight: 900 }}>{clientCount}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* WHY: Small hint text so user knows they can click cities */}
      <p style={{ color: '#334155', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>
        Click any city to view clients →
      </p>
    </div>
  )
}

const TYPEWRITER_WORDS = ['Industries', 'Factories', 'Hospitals', 'Malls', 'Schools', 'Businesses']

function TypeWriter() {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState(TYPEWRITER_WORDS[0])
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const word = TYPEWRITER_WORDS[index]
    let timeout
    if (!deleting && displayed.length < word.length) timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80)
    else if (!deleting && displayed.length === word.length) timeout = setTimeout(() => setDeleting(true), 1800)
    else if (deleting && displayed.length > 0) timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
    else if (deleting && displayed.length === 0) { setDeleting(false); setIndex((index + 1) % TYPEWRITER_WORDS.length) }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, index])
  return <span className="typewriter-word" aria-label={TYPEWRITER_WORDS[0]} style={{ color: '#f97316' }}><span aria-hidden="true">{displayed}</span><span aria-hidden="true" className="typing-caret" style={{ animation: 'blink 1s step-end infinite', color: '#f97316' }}>|</span></span>
}

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
    for (let i = 0; i < 60; i++) {
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
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.6 }} />
}

function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (2000 / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, target])
  return <span ref={ref}>{count}{suffix}</span>
}

const testimonials = [
  { name: 'Ravi Kumar', role: 'Facility Manager, City Center Mall', rating: 5, text: 'Wipro Fire & Safety installed a complete fire alarm and hydrant system in our mall. The team was professional, on time, and the quality of work is excellent. Highly recommended!' },
  { name: 'Dr. Suresh Reddy', role: 'Director, KMC Hospital', rating: 5, text: 'We have been their AMC client for 5 years. Every inspection is thorough and their response time during emergencies is outstanding. Fully trust them with our hospital safety.' },
  { name: 'Venkat Rao', role: 'Plant Head, Kurnool Steel Plant', rating: 5, text: 'They handled our entire factory fire safety setup — extinguishers, hydrants, PPE, and training for 200 employees. Excellent service at competitive prices.' },
  { name: 'Prasad Naidu', role: 'Principal, Nagarjuna College', rating: 5, text: 'The safety audit they conducted identified critical gaps we had missed. Their team fixed everything within 2 days. Our college is now fully compliant with fire safety norms.' },
  { name: 'Anitha Sharma', role: 'Owner, Srinivasa Warehouse', rating: 5, text: 'Quick response, certified products, and excellent after-sales support. They installed hydrant systems across our entire warehouse complex without disrupting operations.' },
]

const projects = [
  { title: 'City Center Mall', category: 'Commercial', desc: 'Complete fire safety system installation covering 3 floors, 50+ extinguishers, addressable alarm system and hydrant network.', img: '/products/hydrant.jpg', tag: 'Completed 2024' },
  { title: 'Kurnool Steel Factory', category: 'Industrial', desc: 'Industrial fire suppression system with CO2 flooding, PPE supply for 200 workers and quarterly AMC services.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600', tag: 'Ongoing AMC' },
  { title: 'KMC Hospital', category: 'Healthcare', desc: 'Life safety system upgrade with advanced smoke detection, emergency lighting, exit signage and staff training program.', img: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600', tag: 'Completed 2023' },
  { title: 'APSRTC Bus Depot', category: 'Government', desc: 'Government facility fire compliance project with 100+ extinguishers, hose reels and annual maintenance contract.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', tag: 'Completed 2024' },
]

const faqs = [
  { q: 'What types of fire extinguishers do you supply?', a: 'We supply ABC Dry Powder, CO2, Water, Foam, and Clean Agent fire extinguishers — all ISI certified and suitable for different fire classes (A, B, C, D, K). We help you select the right type based on your facility.' },
  { q: 'Do you provide Annual Maintenance Contracts (AMC)?', a: 'Yes! Our AMC covers quarterly inspection, servicing, pressure testing, refilling, and certification of all fire safety equipment. You receive a detailed service report after every visit.' },
  { q: 'How quickly can you respond to emergency calls?', a: 'We provide 24/7 emergency support. For clients in Kurnool city, our response time is typically under 2 hours. We also offer priority AMC plans with guaranteed same-day response.' },
  { q: 'Are your products certified and approved?', a: 'Yes, all our products are ISI marked, BIS certified, and approved by the relevant State Fire Department. We are also ISO certified and GST registered. We provide proper documentation for all installations.' },
  { q: 'Do you provide fire safety training for employees?', a: 'Absolutely! We conduct hands-on fire safety training covering extinguisher operation, evacuation procedures, and emergency response. Certificate of training is issued to all participants.' },
  { q: 'What is the cost of a fire safety audit?', a: 'We offer the first fire safety audit completely FREE for new clients. Our expert will visit your facility, assess risks, and provide a detailed compliance report with recommendations — at no charge.' },
  { q: 'Which areas do you serve?', a: 'We primarily serve Kurnool district and surrounding areas in Andhra Pradesh including Nandyal, Kadapa, Anantapur, and Guntur. For large projects, we can serve across Andhra Pradesh.' },
]

const certificates = [
  { title: 'ISO Certified', subtitle: 'Quality Management', icon: '🏆', color: '#f97316' },
  { title: 'Fire Dept Approved', subtitle: 'Govt. of Andhra Pradesh', icon: '🔥', color: '#ef4444' },
  { title: 'ISI Marked', subtitle: 'Bureau of Indian Standards', icon: '✅', color: '#22c55e' },
  { title: 'GST Registered', subtitle: 'Govt. Tax Compliant', icon: '📋', color: '#eab308' },
  { title: 'JustDial Verified', subtitle: '4.8★ Rating', icon: '⭐', color: '#f97316' },
  { title: '18+ Years', subtitle: 'Industry Experience', icon: '🛡️', color: '#3b82f6' },
]

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeProject, setActiveProject] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [])

  const certifications = [
    { icon: Award, title: 'ISO Certified', description: 'International quality standards', color: '#f97316' },
    { icon: Shield, title: 'Fire Dept Approved', description: 'Official government certification', color: '#eab308' },
    { icon: CheckCircle, title: 'JustDial Verified', description: 'Trusted by thousands', color: '#22c55e' },
  ]

  const industries = [
    { icon: ShoppingBag, name: 'Malls', count: '50+' },
    { icon: Factory, name: 'Factories', count: '200+' },
    { icon: Hospital, name: 'Hospitals', count: '30+' },
    { icon: School, name: 'Schools', count: '80+' },
    { icon: Building2, name: 'Offices', count: '300+' },
    { icon: Warehouse, name: 'Warehouses', count: '100+' },
  ]

  const features = [
    { title: 18, suffix: '+', subtitle: 'Years Experience' },
    { title: 1000, suffix: '+', subtitle: 'Clients Served' },
    { title: 24, suffix: '/7', subtitle: 'Support' },
    { title: 100, suffix: '%', subtitle: 'Compliance' },
  ]

  const trustItems = [
    { icon: '🏆', label: 'ISO Certified' },
    { icon: '🔥', label: 'Fire Dept Approved' },
    { icon: '📋', label: 'GST Registered' },
    { icon: '⚡', label: '24/7 Support' },
    { icon: '📍', label: 'Kurnool, AP' },
    { icon: '✅', label: '18+ Years Experience' },
  ]

  return (
    <div className="min-h-screen legacy-page" data-testid="home-page">
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse-border { 0%,100%{border-color:rgba(249,115,22,0.3)} 50%{border-color:rgba(249,115,22,0.8)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 40px rgba(249,115,22,0.4)} 50%{box-shadow:0 0 80px rgba(249,115,22,0.8)} }
      `}</style>

      {/* ── HERO ── */}
      <section className="home-hero relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1761933401853-09566029ed3a" alt="Industrial facility" fetchPriority="high" className="hero-image w-full h-full object-cover" />
          <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950" />
        </div>
        <FireParticles />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl" style={{ zIndex: 1 }} />
        <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-8">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400 font-semibold tracking-wider">TRUSTED SINCE 2007</span>
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
              Protecting<br /><TypeWriter />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="hero-intro text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Premium fire safety solutions for industrial and commercial spaces. ISO certified with 18+ years of excellence in Kurnool, AP.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="hero-actions flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/contact" className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black tracking-wide uppercase px-10 py-4 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300" style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                <span className="flex items-center gap-2">Get a Free Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              </Link>
              <Link to="/services" className="border-2 border-slate-600 hover:border-orange-500 text-slate-300 hover:text-white font-bold tracking-wide uppercase px-10 py-4 transition-all duration-300" style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                Our Services
              </Link>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="hero-stats grid grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }} className="relative backdrop-blur-md bg-slate-900/60 border border-white/10 p-6 text-center hover:border-orange-500/50 transition-all duration-300 group" style={{ animation: 'pulse-border 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400"><CountUp target={f.title} suffix={f.suffix} /></h3>
                <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">{f.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-slate-500 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent" />
        </motion.div>
      </section>

      {/* ── TRUSTED BY — double marquee ── */}
      {/* WHY: Real brand names (IndiGo, D-Mart, Indian Oil) build instant credibility */}
      {/* Two rows in opposite directions is a premium SaaS website pattern */}
      <section style={{ background: '#0a0f1a', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '44px 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ color: '#334155', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Trusted By</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to right, transparent, #f97316)' }} />
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '-0.5px' }}>151+ Verified Installations</span>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to left, transparent, #f97316)' }} />
          </div>
        </div>
        {/* Row 1 scrolls left */}
        <div style={{ overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 70s linear infinite' }}>
            {[...clientsRow1, ...clientsRow1].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 36px', whiteSpace: 'nowrap' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', opacity: 0.8, flexShrink: 0 }} />
                <span style={{ color: '#475569', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Row 2 scrolls right — animation: reverse keyword flips direction */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 70s linear infinite reverse' }}>
            {[...clientsRow2, ...clientsRow2].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 36px', whiteSpace: 'nowrap' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#eab308', opacity: 0.8, flexShrink: 0 }} />
                <span style={{ color: '#475569', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 20px' }} />
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Why Us</span>
            <h2 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mt-3 mb-4">Why Choose <span className="text-orange-500">Wipro</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Trusted by leading organizations across Andhra Pradesh</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => {
              const Icon = cert.icon
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} whileHover={{ y: -16, scale: 1.02 }} className="group relative overflow-hidden bg-slate-900 border border-slate-800 p-10 hover:border-orange-500/40 transition-all duration-500">
                  <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.2 + 0.4 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${cert.color}, transparent)`, transformOrigin: 'left' }} />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', color: cert.color, fontSize: '12px', fontWeight: 800, opacity: 0.5 }}>0{index + 1}</div>
                  <div className="relative z-10">
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${cert.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: `1px solid ${cert.color}30` }}>
                      <Icon style={{ width: '28px', height: '28px', color: cert.color }} />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{cert.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{cert.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)', animation: 'shimmer 3s infinite', animationDelay: `${index}s` }} />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ maxWidth: '1200px', margin: 'auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 20px' }} />
            <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Coverage</span>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>Industries We <span style={{ color: '#f97316' }}>Serve</span></h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {industries.map((industry, index) => {
              const Icon = industry.icon
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1, ease: 'backOut' }} whileHover={{ y: -14, scale: 1.04 }} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '999px', padding: '2px 8px', fontSize: '10px', color: '#f97316', fontWeight: 700 }}>{industry.count}</div>
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon style={{ width: '28px', height: '28px', color: '#f97316' }} />
                  </motion.div>
                  <h3 style={{ color: 'white', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{industry.name}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ── */}
      <section style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
        <div style={{ maxWidth: '1100px', margin: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', position: 'relative', zIndex: 1 }}>
          {[
            { value: 1000, suffix: '+', label: 'Happy Clients', icon: '😊' },
            { value: 18, suffix: '+', label: 'Years in Business', icon: '📅' },
            { value: 5000, suffix: '+', label: 'Equipments Installed', icon: '🔧' },
            { value: 100, suffix: '%', label: 'Compliance Rate', icon: '✅' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', lineHeight: 1 }}><CountUp target={s.value} suffix={s.suffix} /></div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ORBITAL NETWORK REACH ── */}
      {/* WHY: Made it interactive — clicking a city navigates to a client page */}
      {/* Kurnool now has a labeled HQ badge in the center — makes geographic authority clear */}
      <section className="py-32 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Our Reach</span>
            <h2 className="text-5xl lg:text-6xl font-black text-white uppercase mt-4 mb-8">South India's <span className="text-orange-500">Network</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              We provide localized support and certified safety solutions across major industrial and commercial hubs. Our rapid-response network ensures your facility is always protected.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {['24/7 Support', 'Statewide AMC', 'Fire Dept Approved', 'ISO Certified'].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">{text}</span>
                </div>
              ))}
            </div>
            {/* WHY: Link to full clients page so users can see all 151 clients */}
            <Link to="/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '10px', color: '#f97316', fontWeight: 700, fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.15)' }}>
              View All 151+ Clients <ArrowRight size={14} />
            </Link>
          </motion.div>
          <div className="flex justify-center items-center">
            <OrbitalReach />
          </div>
        </div>
      </section>

      {/* ── PROJECT SHOWCASE ── */}
      <section style={{ padding: '100px 40px', background: '#020617' }}>
        <div style={{ maxWidth: '1200px', margin: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 20px' }} />
            <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Our Work</span>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>Project <span style={{ color: '#f97316' }}>Showcase</span></h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Real installations across Kurnool and Andhra Pradesh</p>
          </motion.div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
            {projects.map((p, i) => (
              <button key={i} onClick={() => setActiveProject(i)} style={{ padding: '8px 20px', borderRadius: '999px', border: activeProject === i ? 'none' : '1px solid #334155', background: activeProject === i ? 'linear-gradient(135deg, #ea580c, #f97316)' : 'transparent', color: activeProject === i ? 'white' : '#64748b', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {p.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div className="project-grid" key={activeProject} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
                <img src={projects[activeProject].img} alt={projects[activeProject].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(249,115,22,0.3), transparent)' }} />
                <span style={{ position: 'absolute', top: '20px', left: '20px', padding: '6px 14px', background: 'rgba(249,115,22,0.9)', color: 'white', fontWeight: 700, fontSize: '12px', borderRadius: '999px' }}>{projects[activeProject].tag}</span>
              </div>
              <div style={{ padding: '48px' }}>
                <span style={{ color: '#f97316', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{projects[activeProject].category}</span>
                <h3 style={{ color: 'white', fontSize: '36px', fontWeight: 900, textTransform: 'uppercase', margin: '12px 0 16px', letterSpacing: '-1px' }}>{projects[activeProject].title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.8, marginBottom: '32px' }}>{projects[activeProject].desc}</p>
                <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #ea580c, #f97316)', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase', borderRadius: '10px' }}>
                  Similar Project? <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #020617, #0f172a)' }}>
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 20px' }} />
            <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Client Reviews</span>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>What Clients <span style={{ color: '#f97316' }}>Say</span></h2>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.5 }} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)' }} />
              <Quote size={48} color="rgba(249,115,22,0.2)" style={{ marginBottom: '24px' }} />
              <p style={{ color: '#e2e8f0', fontSize: '20px', lineHeight: 1.8, marginBottom: '32px', fontStyle: 'italic' }}>"{testimonials[activeTestimonial].text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>{testimonials[activeTestimonial].name}</div>
                  <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{testimonials[activeTestimonial].role}</div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => <Star key={i} size={20} fill="#f97316" color="#f97316" />)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {testimonials.map((_, i) => (
              <button aria-label={`Show review ${i + 1}`} aria-pressed={i === activeTestimonial} key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i === activeTestimonial ? '28px' : '8px', height: '8px', borderRadius: '999px', background: i === activeTestimonial ? '#f97316' : '#334155', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATES ── */}
      <section style={{ padding: '100px 40px', background: '#020617', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ maxWidth: '1100px', margin: 'auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 20px' }} />
            <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Credentials</span>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>Our <span style={{ color: '#f97316' }}>Certifications</span></h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Fully certified, compliant and government approved</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {certificates.map((cert, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring' }} whileHover={{ y: -8, scale: 1.02 }} style={{ background: '#0f172a', border: `1px solid ${cert.color}25`, borderRadius: '16px', padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${cert.color}, transparent)` }} />
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{cert.icon}</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>{cert.title}</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>{cert.subtitle}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #020617, #0f172a)' }}>
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #eab308)', margin: '0 auto 20px' }} />
            <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Got Questions?</span>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '12px 0' }}>FAQ<span style={{ color: '#f97316' }}>s</span></h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ background: '#0f172a', border: `1px solid ${openFaq === i ? 'rgba(249,115,22,0.4)' : '#1e293b'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.3s' }}>
                <button aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', gap: '16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px', textAlign: 'left' }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ flexShrink: 0 }}>
                    <ChevronDown size={20} color="#f97316" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div style={{ padding: '0 24px 24px', color: '#94a3b8', fontSize: '15px', lineHeight: 1.8, borderTop: '1px solid #1e293b' }}>
                        <div style={{ paddingTop: '16px' }}>{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '100px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40px', left: '40px', width: '60px', height: '60px', borderTop: '2px solid rgba(249,115,22,0.4)', borderLeft: '2px solid rgba(249,115,22,0.4)' }} />
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '60px', height: '60px', borderBottom: '2px solid rgba(249,115,22,0.4)', borderRight: '2px solid rgba(249,115,22,0.4)' }} />
        <div style={{ maxWidth: '900px', margin: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: '999px', marginBottom: '24px' }}>
              <Zap style={{ width: '14px', height: '14px', color: '#f97316' }} />
              <span style={{ color: '#f97316', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Free Consultation Available</span>
            </motion.div>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-1px', margin: '16px 0 20px', lineHeight: 1.1 }}>
              Get a Free Safety<br /><span style={{ color: '#f97316' }}>Audit Today</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.7 }}>
              Our experts will assess your facility and recommend the right fire safety systems — at no cost to you.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/contact" style={{ padding: '18px 44px', background: 'linear-gradient(135deg, #ea580c, #f97316)', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block', boxShadow: '0 0 40px rgba(249,115,22,0.3)' }}>
                  Book Free Audit
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <a href="tel:+918019918288" style={{ padding: '18px 44px', border: '2px solid #334155', color: '#e2e8f0', fontWeight: 700, textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block' }}>
                  Call +91 80199 18288
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ background: '#050d1a', borderTop: '1px solid #1e293b', padding: '28px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {trustItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default Home

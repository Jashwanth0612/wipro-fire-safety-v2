import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Clock, Flame, Mail, MapPin, MessageCircle, Phone, Plus, Trash2 } from 'lucide-react'
import { useQuote } from '../context/QuoteContext'
import { submitInquiry } from '../lib/api'

const emptyForm = { name:'',email:'',phone:'',message:'',service:'' }
const serviceAreas = ['Kurnool','Hyderabad','Bengaluru','Chennai','Vizag','Vijayawada','Nandyal','Kadapa','Anantapur','Guntur']
const address = 'Priya Homes, Vishnu Township, Auto Nagar, Lanjapeta, Kurnool, AP 518003'
export default function Contact() {
  const { products, remove, updateQuantity, clear } = useQuote()
  const [form,setForm] = useState(emptyForm)
  const [status,setStatus] = useState('idle')
  const [error,setError] = useState('')
  const controller = useRef(null)
  const statusRef = useRef(null)
  const sending = useRef(false)
  useEffect(() => () => controller.current?.abort(), [])
  const change = event => setForm(current => ({ ...current,[event.target.name]:event.target.value }))
  const submit = async event => {
    event.preventDefault()
    if (sending.current) return
    const digits = form.phone.replace(/\D/g,'')
    if (digits.length < 10 || digits.length > 15) { setError('Enter a valid phone number with 10 to 15 digits.'); setStatus('error'); return }
    if (!form.name.trim() || !form.message.trim()) { setError('Please enter your name and enquiry details.'); setStatus('error'); return }
    sending.current = true
    setStatus('sending'); setError('')
    controller.current = new AbortController()
    const timeout = setTimeout(() => controller.current?.abort(), 30000)
    try {
      await submitInquiry(form, products, { signal:controller.current.signal })
      setStatus('success'); setForm(emptyForm); clear()
      requestAnimationFrame(() => statusRef.current?.focus())
    } catch (err) {
      setStatus('error')
      setError(err.name === 'AbortError' ? 'The request timed out. Your enquiry may still have reached us. Please call or email to confirm before sending again.' : 'We could not confirm your enquiry. Your details are still here. Try again, or contact us by phone or email.')
    } finally { clearTimeout(timeout); sending.current = false }
  }
  return <div className="contact-page">
    <header className="container page-heading"><p className="eyebrow"><Flame size={16} /> LET’S TALK SAFETY</p><h1>Your next step to <span>better protection.</span></h1><p className="lede">Reach out for a free safety audit, product enquiry or service quote. We respond within 24 hours.</p></header>
    <div className="container contact-layout">
      <aside className="contact-sidebar">
        <div className="contact-card"><p className="eyebrow">CONTACT US</p><h2>A conversation starts here.</h2><a className="contact-method" href="tel:+918019918288"><Phone /><span><small>Phone / WhatsApp · Available 24/7</small><strong>+91 80199 18288</strong></span></a><a className="contact-method" href="https://wa.me/918019918288" target="_blank" rel="noreferrer"><MessageCircle /><span><small>WhatsApp · Quick response</small><strong>Chat with our team <ArrowRight size={15} /></strong></span></a><a className="contact-method" href="mailto:jashwanthsai268@gmail.com"><Mail /><span><small>Email · Reply in 24 hours</small><strong>jashwanthsai268@gmail.com</strong></span></a><a className="contact-method" href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"><MapPin /><span><small>Our office</small><strong>{address}</strong></span></a><div className="contact-method"><Clock /><span><small>Hours</small><strong>Mon–Sat: 9AM–6PM<br />Emergency: 24/7</strong></span></div></div>
        <div className="service-areas"><h3>Service areas</h3><div>{serviceAreas.map(area => <span key={area}>{area}</span>)}</div></div>
        <div className="location-map"><iframe title="Kurnool service area map" src="https://maps.google.com/maps?q=Kurnool%2C%20Andhra%20Pradesh&t=&z=12&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><p>Serving Kurnool and South India. Use the office address above for directions.</p></div>
      </aside>
      <section className="inquiry-card" id="inquiry" aria-labelledby="inquiry-heading"><div className="inquiry-heading"><span className="eyebrow">TELL US WHAT YOU NEED</span><h2 id="inquiry-heading">Send an enquiry</h2><p>First safety audit is FREE — we respond within 24 hours.</p></div>
        {products.length > 0 && <div className="quote-summary"><div className="quote-summary-heading"><h3>Your quote shortlist</h3><Link to="/products"><Plus size={15} /> Add products</Link></div><p>Choose quantities below. Our team will confirm models, availability and pricing.</p>{products.map(product => <div className="quote-item" key={product.id}><img src={product.img} alt="" /><div><strong>{product.title}</strong><span>{product.subtitle}</span></div><label><span className="sr-only">Quantity for {product.title}, {product.subtitle}</span><input type="number" min="1" max="999" value={product.quantity} onChange={event => updateQuantity(product.id,event.target.value)} disabled={status === 'sending'} /></label><button className="icon-button" disabled={status === 'sending'} onClick={() => remove(product.id)} aria-label={`Remove ${product.title}, ${product.subtitle}`}><Trash2 size={17} /></button></div>)}</div>}
        {status === 'success' && <div className="form-success" role="status" tabIndex="-1" ref={statusRef}><CheckCircle size={22} /><div><strong>Enquiry received.</strong><p>Our team will contact you shortly. Thank you for getting in touch.</p></div></div>}
        {status === 'error' && <div className="form-error" role="alert"><p>{error}</p><a href="tel:+918019918288">Call +91 80199 18288</a><span> · </span><a href="mailto:jashwanthsai268@gmail.com">Email our team</a></div>}
        <form onSubmit={submit} className="inquiry-form" aria-busy={status === 'sending'}><fieldset disabled={status === 'sending'}><legend className="sr-only">Your contact details and enquiry</legend><div className="form-row"><label htmlFor="contact-name">Full name <span aria-hidden="true">*</span><input id="contact-name" name="name" autoComplete="name" required maxLength="120" value={form.name} onChange={change} placeholder="Your name" /></label><label htmlFor="contact-phone">Phone number <span aria-hidden="true">*</span><input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength="10" maxLength="22" value={form.phone} onChange={change} placeholder="Your contact number" /></label></div><label htmlFor="contact-email">Email address <span aria-hidden="true">*</span><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength="254" value={form.email} onChange={change} placeholder="you@company.com" /></label><label htmlFor="contact-service">Service required<select id="contact-service" name="service" value={form.service} onChange={change}><option value="">Select a service</option><option value="installation">Fire Safety Installation</option><option value="amc">Annual Maintenance Contract (AMC)</option><option value="audit">Free Safety Audit</option><option value="refilling">Extinguisher Refilling</option><option value="training">Safety Training</option><option value="other">Other / General Enquiry</option></select></label><label htmlFor="contact-message">Your requirements <span aria-hidden="true">*</span><textarea id="contact-message" name="message" required maxLength="5000" rows="5" value={form.message} onChange={change} placeholder="Tell us about your facility, location and what you need." /></label><p className="form-note">Fields marked * are required. Your selected products will be included with this enquiry.</p><button className="button submit-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending your enquiry…' : 'Send enquiry'}<ArrowRight size={18} /></button></fieldset></form>
      </section>
    </div><section className="container contact-bottom"><p>Explore what we offer</p><div className="button-row"><Link className="button button-secondary" to="/services">Our services</Link><Link className="button button-secondary" to="/products">Products</Link><Link className="button button-secondary" to="/about">About us</Link></div></section>
  </div>
}

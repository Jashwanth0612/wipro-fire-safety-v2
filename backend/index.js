const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const Inquiry = require('./models/Inquiry')
const Product = require('./models/Product')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

// Test route
app.get('/', (req, res) => {
  res.send('Wipro Fire & Safety Backend Running')
})

// ---------------- PUBLIC ----------------

// Save inquiry (public)
app.post('/api/inquiry', async (req, res) => {
  try {
    const inquiry = new Inquiry(req.body)
    await inquiry.save()
    res.status(201).json({ message: 'Inquiry saved' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save inquiry' })
  }
})

// Get products (public)
app.get('/api/products', async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 })
  res.json(items)
})

// ---------------- SIMPLE AI CHAT ----------------

app.post('/api/chat', (req, res) => {
  const q = (req.body.message || '').toLowerCase()

  let reply = "I'm here to help with anything about Wipro Fire & Safety."

  if (q.includes('service')) {
    reply =
      "We provide fire alarm systems, fire extinguishers, hydrant systems, installation, AMC (annual maintenance), compliance support, and industrial safety solutions."
  } else if (q.includes('mall') || q.includes('install')) {
    reply =
      "Yes, we install complete fire safety systems in malls, factories, offices, hospitals, and residential complexes."
  } else if (q.includes('office') || q.includes('location') || q.includes('address')) {
    reply =
      "Our office is located at: Priya Homes, Vishnu Township, Plot No 30 & 31, Phase 2, Auto Nagar, Guru Raghavendra Nagar, Lanjapeta, Andhra Pradesh 518003."
  } else if (q.includes('ceo') || q.includes('owner')) {
    reply =
      "The CEO of Wipro Fire & Safety is Mr. V. Ramanjaneyulu."
  } else if (q.includes('iso') || q.includes('certification')) {
    reply =
      "Yes, we are ISO certified and approved by the Fire Department. We are also listed on JustDial."
  } else if (q.includes('contact') || q.includes('phone') || q.includes('number')) {
    reply =
      "You can contact us at +91 8019918288 or email us at jashwanthsai268@gmail.com."
  } else if (q.includes('year') || q.includes('since') || q.includes('founded')) {
    reply =
      "Wipro Fire & Safety has been serving customers since 2007."
  }

  res.json({ reply })
})

// ---------------- ADMIN AUTH ----------------

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const JWT_SECRET = process.env.JWT_SECRET
if (!ADMIN_PASSWORD || !JWT_SECRET) {
  throw new Error('ADMIN_PASSWORD and JWT_SECRET must be configured')
}
const ADMIN_USER = {
  username: ADMIN_USERNAME,
  passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10)
}

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body

  if (username !== ADMIN_USER.username) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = bcrypt.compareSync(password, ADMIN_USER.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' })
  res.json({ token })
})

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })

  try {
    const token = header.split(' ')[1]
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Get all inquiries (admin only)
app.get('/api/admin/inquiries', auth, async (req, res) => {
  const data = await Inquiry.find().sort({ createdAt: -1 })
  res.json(data)
})

// Mark inquiry as contacted (admin only)
app.patch('/api/admin/inquiries/:id', auth, async (req, res) => {
  try {
    await Inquiry.findByIdAndUpdate(req.params.id, { contacted: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inquiry' })
  }
})

// ---------------- PRODUCT MANAGEMENT (ADMIN) ----------------

// Add product
app.post('/api/admin/products', auth, async (req, res) => {
  try {
    const p = new Product(req.body)
    await p.save()
    res.status(201).json(p)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' })
  }
})

// Delete product
app.delete('/api/admin/products/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// ------------------------------------------------------------

const PORT = process.env.PORT || 5050
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

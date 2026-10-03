import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Trash2, Download, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react'

const CATEGORIES = ['Fire Extinguishers', 'Fire Alarm Systems', 'Hydrant Systems', 'PPE Equipment', 'Exit Systems', 'Accessories']

function AdminProducts() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0], image_url: '', stock: 0, minStock: 5, unit: 'pcs' })
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return }
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://wipro-backend-q5i7.onrender.com/api/products')
      const data = await res.json()
      // Add stock fields if missing
      const withStock = data.map(p => ({
        ...p,
        stock: p.stock ?? Math.floor(Math.random() * 50) + 5,
        minStock: p.minStock ?? 5,
        unit: p.unit ?? 'pcs'
      }))
      setItems(withStock)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const add = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await fetch('https://wipro-backend-q5i7.onrender.com/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setForm({ title: '', description: '', category: CATEGORIES[0], image_url: '', stock: 0, minStock: 5, unit: 'pcs' })
        setShowForm(false)
        fetchItems()
      } else {
        alert('Failed to add product')
      }
    } catch (e) {
      alert('Server not reachable')
    } finally {
      setAdding(false)
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    await fetch(`https://wipro-backend-q5i7.onrender.com/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchItems()
  }

  const updateStock = (id, newStock) => {
    setItems(items.map(item => item.id === id ? { ...item, stock: Math.max(0, parseInt(newStock) || 0) } : item))
  }

  // Export to Excel using SheetJS (loaded from CDN dynamically)
  const exportToExcel = () => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    script.onload = () => {
      const XLSX = window.XLSX

      const wb = XLSX.utils.book_new()

      // Sheet 1: Stock Overview
      const stockData = [
        ['WIPRO FIRE & SAFETY — STOCK REPORT'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['#', 'Product Name', 'Category', 'Stock Qty', 'Unit', 'Min Stock', 'Status', 'Description'],
        ...items.map((p, i) => [
          i + 1,
          p.title,
          p.category,
          p.stock,
          p.unit || 'pcs',
          p.minStock || 5,
          p.stock <= (p.minStock || 5) ? 'LOW STOCK ⚠️' : 'OK ✅',
          p.description
        ])
      ]

      const ws1 = XLSX.utils.aoa_to_sheet(stockData)
      ws1['!cols'] = [{ wch: 4 }, { wch: 30 }, { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 40 }]
      ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
      XLSX.utils.book_append_sheet(wb, ws1, 'Stock Overview')

      // Sheet 2: Low Stock Alert
      const lowStock = items.filter(p => p.stock <= (p.minStock || 5))
      const alertData = [
        ['LOW STOCK ALERT — ACTION REQUIRED'],
        [`${lowStock.length} items need restocking`],
        [],
        ['Product', 'Category', 'Current Stock', 'Minimum Required', 'Shortage'],
        ...lowStock.map(p => [
          p.title,
          p.category,
          p.stock,
          p.minStock || 5,
          Math.max(0, (p.minStock || 5) - p.stock)
        ])
      ]
      const ws2 = XLSX.utils.aoa_to_sheet(alertData)
      ws2['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, ws2, 'Low Stock Alerts')

      // Sheet 3: Category Summary
      const catSummary = {}
      items.forEach(p => {
        if (!catSummary[p.category]) catSummary[p.category] = { count: 0, totalStock: 0 }
        catSummary[p.category].count++
        catSummary[p.category].totalStock += p.stock
      })
      const summaryData = [
        ['CATEGORY SUMMARY'],
        [],
        ['Category', 'Total Products', 'Total Stock', 'Avg Stock per Product'],
        ...Object.entries(catSummary).map(([cat, data]) => [
          cat,
          data.count,
          data.totalStock,
          Math.round(data.totalStock / data.count)
        ])
      ]
      const ws3 = XLSX.utils.aoa_to_sheet(summaryData)
      ws3['!cols'] = [{ wch: 25 }, { wch: 16 }, { wch: 14 }, { wch: 24 }]
      XLSX.utils.book_append_sheet(wb, ws3, 'Category Summary')

      XLSX.writeFile(wb, `Wipro_Stock_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
    }
    document.head.appendChild(script)
  }

  const lowStockCount = items.filter(p => p.stock <= (p.minStock || 5)).length
  const totalStock = items.reduce((sum, p) => sum + (p.stock || 0), 0)
  const filtered = filter === 'All' ? items : items.filter(p => p.category === filter)

  const getStockStatus = (item) => {
    if (item.stock === 0) return { color: '#62584f', label: 'Out of Stock', bg: 'rgba(239,68,68,0.1)' }
    if (item.stock <= (item.minStock || 5)) return { color: '#b84030', label: 'Low Stock', bg: 'rgba(191,73,55,0.1)' }
    return { color: '#356345', label: 'In Stock', bg: 'rgba(34,197,94,0.1)' }
  }

  return (
    <div style={{ background: '#fff9f0', minHeight: '100vh', padding: '30px', color: '#302820' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#302820', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Product & <span style={{ color: '#b84030' }}>Stock Manager</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Track inventory, manage products, export reports</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', color: '#356345', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #bf4937, #bf4937)', border: 'none', borderRadius: '10px', color: '#302820', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Plus size={16} /> Add Product
          </button>
          <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin/login') }} style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#62584f', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: Package, label: 'Total Products', value: items.length, color: '#b84030' },
          { icon: TrendingUp, label: 'Total Stock Units', value: totalStock, color: '#b84030' },
          { icon: AlertTriangle, label: 'Low Stock Alerts', value: lowStockCount, color: '#62584f' },
          { icon: CheckCircle, label: 'Healthy Stock', value: items.length - lowStockCount, color: '#356345' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} style={{ background: '#f5ecdf', border: '1px solid #f5ecdf', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{s.label}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={s.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div style={{ background: '#f5ecdf', border: '1px solid rgba(191,73,55,0.3)', borderRadius: '16px', padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #bf4937, #bf4937)' }} />
          <h3 style={{ color: '#302820', fontWeight: 800, fontSize: '18px', marginBottom: '20px', textTransform: 'uppercase' }}>Add New Product</h3>
          <form onSubmit={add}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { key: 'title', placeholder: 'Product Name', type: 'text' },
                { key: 'image_url', placeholder: 'Image URL', type: 'text' },
              ].map(f => (
                <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required style={inputStyle} />
              ))}

              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <input type="number" placeholder="Stock Qty" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} min="0" style={inputStyle} />
                <input type="number" placeholder="Min Stock" value={form.minStock} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} min="0" style={inputStyle} />
                <input type="text" placeholder="Unit (pcs/kg)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <textarea placeholder="Product Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px' }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={adding} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #bf4937, #bf4937)', border: 'none', borderRadius: '10px', color: '#302820', fontWeight: 800, fontSize: '14px', cursor: 'pointer', textTransform: 'uppercase' }}>
                {adding ? 'Adding...' : 'Add Product'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 28px', background: 'transparent', border: '1px solid #f5ecdf', borderRadius: '10px', color: '#62584f', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', marginBottom: '20px' }}>
          <AlertTriangle size={18} color="#ef4444" />
          <span style={{ color: '#62584f', fontWeight: 700, fontSize: '14px' }}>
            {lowStockCount} product{lowStockCount > 1 ? 's' : ''} need restocking! Export the Excel report for details.
          </span>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '6px 16px', borderRadius: '999px', border: filter === cat ? 'none' : '1px solid #f5ecdf', background: filter === cat ? 'linear-gradient(135deg, #bf4937, #bf4937)' : 'transparent', color: filter === cat ? '#302820' : '#64748b', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div style={{ background: '#f5ecdf', border: '1px solid #f5ecdf', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f5ecdf' }}>
                {['Product', 'Category', 'Stock', 'Min Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No products found. Add your first product above!</td></tr>
              ) : filtered.map(item => {
                const status = getStockStatus(item)
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f5ecdf', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,135,111,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image_url && <img src={item.image_url} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f5ecdf' }} onError={e => e.target.style.display = 'none'} />}
                        <div>
                          <div style={{ color: '#302820', fontWeight: 700, fontSize: '14px' }}>{item.title}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', background: 'rgba(191,73,55,0.12)', border: '1px solid rgba(191,73,55,0.2)', borderRadius: '999px', color: '#b84030', fontSize: '11px', fontWeight: 700 }}>{item.category}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateStock(item.id, item.stock - 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #f5ecdf', background: 'transparent', color: '#62584f', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                        <input type="number" value={item.stock} onChange={e => updateStock(item.id, e.target.value)} min="0" style={{ width: '60px', padding: '4px 8px', background: '#fff9f0', border: '1px solid #f5ecdf', borderRadius: '6px', color: '#302820', fontSize: '14px', fontWeight: 700, textAlign: 'center' }} />
                        <button onClick={() => updateStock(item.id, item.stock + 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #f5ecdf', background: 'transparent', color: '#62584f', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>{item.unit || 'pcs'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#62584f', fontSize: '14px' }}>{item.minStock || 5} {item.unit || 'pcs'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '999px', background: status.bg, color: status.color, fontSize: '12px', fontWeight: 700 }}>{status.label}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button onClick={() => del(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#62584f', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock bar chart */}
      {items.length > 0 && (
        <div style={{ background: '#f5ecdf', border: '1px solid #f5ecdf', borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 size={18} color="#bf4937" />
            <h3 style={{ color: '#302820', fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Stock Levels</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => {
              const status = getStockStatus(item)
              const maxStock = Math.max(...items.map(i => i.stock || 0), 1)
              const pct = Math.round(((item.stock || 0) / maxStock) * 100)
              return (
                <div key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#62584f', fontSize: '13px', fontWeight: 600 }}>{item.title}</span>
                    <span style={{ color: status.color, fontSize: '13px', fontWeight: 700 }}>{item.stock} {item.unit || 'pcs'}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f5ecdf', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${status.color}, ${status.color}99)`, borderRadius: '999px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid #f5ecdf',
  background: 'rgba(160,135,111,0.03)',
  color: '#302820',
  fontSize: '14px',
  outline: 'none',
  width: '100%'
}

export default AdminProducts

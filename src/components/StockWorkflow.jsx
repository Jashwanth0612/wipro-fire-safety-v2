import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../lib/api'
import { stockPreview } from '../lib/inventory.mjs'
import { loadPendingStock, recordRecoverableMovement } from '../lib/stock-recovery.mjs'

export default function StockWorkflow({ items, token, onSaved, onError }) {
  const [recovery] = useState(() => {
    try { return { body: loadPendingStock(token), error: '' } }
    catch (error) { return { body: null, error: error.message } }
  })
  const [recoveryError, setRecoveryError] = useState(recovery.error)
  const [form, setForm] = useState(() => recovery.body || { product_id: '', kind: 'receipt', quantity: '', reference: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [history, setHistory] = useState([])
  const [historyError, setHistoryError] = useState('')
  const [historyBusy, setHistoryBusy] = useState(false)
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const [retryBody, setRetryBody] = useState(recovery.body)
  const lock = useRef(false)
  const item = items.find(p => p.id === form.product_id)
  const preview = stockPreview(item?.stock, form.kind, form.quantity)
  const edit = (key, value) => { setForm(current => ({ ...current, [key]: value })); setNotice('') }

  useEffect(() => {
    const controller = new AbortController()
    setHistoryBusy(true); setHistoryError('')
    const query = new URLSearchParams({ offset: String(offset) })
    if (form.product_id) query.set('product_id', form.product_id)
    apiRequest(`/inventory/movements?${query}`, { token, signal: controller.signal })
      .then(rows => { if (!Array.isArray(rows)) throw new Error('Invalid stock history response.'); setHistory(rows) })
      .catch(error => { if (!controller.signal.aborted) { setHistoryError(error.message); if (error.status === 401 || error.status === 403) onError(error) } })
      .finally(() => { if (!controller.signal.aborted) setHistoryBusy(false) })
    return () => controller.abort()
  }, [token, offset, form.product_id, revision, onError])

  useEffect(() => {
    if (!retryBody) return
    const warn = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [retryBody])

  async function save(event) {
    event.preventDefault()
    if (lock.current || recoveryError || (!retryBody && (!item || preview.error))) return
    lock.current = true; setBusy(true); setNotice('')
    const body = retryBody || { product_id: form.product_id, kind: form.kind, quantity: Number(form.quantity), reference: form.reference, note: form.note, expected_stock: item.stock, request_id: crypto.randomUUID() }
    // Retain the exact request after an uncertain network result; retry cannot double-count it.
    setRetryBody(body)
    try {
      const result = await recordRecoverableMovement({ token, body, request: payload => apiRequest('/inventory/movements', { method: 'POST', token, body: payload }) })
      setRetryBody(null)
      setNotice(`Recorded. Balance after this movement: ${result.balance} ${item?.unit || 'units'}.`)
      setForm(current => ({ ...current, quantity: '', reference: '', note: '' }))
      setOffset(0); setRevision(v => v + 1)
      window.dispatchEvent(new Event('wipro:catalogue-changed'))
      await onSaved()
    } catch (error) {
      try { setRetryBody(loadPendingStock(token)) }
      catch (recoveryFailure) { setRecoveryError(recoveryFailure.message) }
      onError(error, 'Could not confirm the stock movement. Retry the same entry safely.')
    } finally { lock.current = false; setBusy(false) }
  }

  return <section className="stock-workflow" aria-labelledby="stock-workflow-title">
    <div className="stock-workflow-heading"><div><p className="eyebrow">DAILY OPERATIONS</p><h2 id="stock-workflow-title">Record once. Stock updates automatically.</h2><p>Record a physical opening count first. Then enter each delivery or dispatch; balances and low-stock alerts update for you.</p></div></div>
    <form onSubmit={save} aria-busy={busy}>
      <fieldset disabled={busy || !!retryBody || !!recoveryError}><legend className="sr-only">Stock movement details</legend>
        <div className="stock-entry-grid">
          <label>Product<select required value={form.product_id} onChange={e => { edit('product_id', e.target.value); setOffset(0) }}><option value="">Choose a product</option>{items.map(p => <option key={p.id} value={p.id}>{p.title}{p.slug ? ` · ${p.slug}` : ''}</option>)}</select></label>
          <label>Action<select value={form.kind} onChange={e => edit('kind', e.target.value)}><option value="receipt">Receive stock</option><option value="dispatch">Dispatch stock</option><option value="count">Physical count / correction</option></select></label>
          <label>{form.kind === 'count' ? 'Actual quantity on shelf' : 'Quantity moved'}<input required type="number" min={form.kind === 'count' ? 0 : 1} max="1000000" step="1" value={form.quantity} onChange={e => edit('quantity', e.target.value)} /></label>
          <label>Delivery / invoice / count reference<input required maxLength={120} value={form.reference} placeholder="e.g. delivery note number" onChange={e => edit('reference', e.target.value)} /></label>
        </div>
        <label>Notes <span>(optional)</span><input maxLength={500} value={form.note} placeholder="Supplier, destination or reason for correction" onChange={e => edit('note', e.target.value)} /></label>
      </fieldset>
      {item && !retryBody && <p className="stock-preview">Current: <strong>{item.stock ?? 'Not recorded'}</strong> {item.unit}. {form.quantity !== '' && (preview.error || <>Expected balance: <strong>{preview.balance}</strong> {item.unit}.</>)} {form.kind === 'count' && 'A count replaces the balance and keeps the previous value in history.'}</p>}
      {recoveryError && <p role="alert">{recoveryError}</p>}
      {retryBody && !busy && <p role="status">This entry is awaiting confirmation and is saved in this browser tab. Retry it here, including after refreshing or signing back in with the same account. Do not repeat it in another tab. Closing this tab can remove recovery details; check history before starting another entry.</p>}
      {retryBody && !item && <p>Recovering product: {retryBody.product_id}. The original entry can still be checked if the product has been archived.</p>}
      <button className="button primary" type="submit" disabled={busy || !!recoveryError || (!retryBody && (!item || !!preview.error))}>{busy ? 'Recording…' : retryBody ? 'Retry same entry safely' : 'Record stock movement'}</button>
      {notice && <p role="status">{notice}</p>}
    </form>
    <details className="stock-history"><summary>Stock movement history</summary><p>Read-only history. Correct mistakes with a new physical count and a reference.</p>
      {historyError ? <p role="alert">{historyError} <button className="text-button" onClick={() => setRevision(v => v + 1)}>Retry history</button></p> : historyBusy ? <p>Loading history…</p> : <><div className="stock-table-scroll"><table><thead><tr>{['When','Product','Action','Quantity','Before → after','Reference','Notes','Recorded by'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{history.map(row => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td><td>{items.find(p => p.id === row.product_id)?.title || 'Archived product'}</td><td>{row.kind}</td><td>{row.quantity}</td><td>{row.previous_stock ?? 'Unrecorded'} → {row.balance}</td><td>{row.reference}</td><td>{row.note || '—'}</td><td title={row.actor_id || ''}>{row.actor_id ? row.actor_id.slice(0,8) : 'System'}</td></tr>)}</tbody></table></div>{!history.length && <p>No movements on this page.</p>}<div className="stock-history-paging"><button disabled={offset === 0} onClick={() => setOffset(v => Math.max(0,v-50))}>Newer</button><span>Page {offset/50+1} · up to 50 entries</span><button disabled={history.length<50} onClick={() => setOffset(v => v+50)}>Older</button></div></>}
    </details>
  </section>
}

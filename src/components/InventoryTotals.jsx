import { inventoryUnitSummary } from '../lib/inventory.mjs'

export default function InventoryTotals({ items }) {
  const units = inventoryUnitSummary(items)
  if (!units.length) return null
  return <details className="stock-history">
    <summary>Recorded stock by unit</summary>
    <p>Each unit is totalled separately. Products awaiting a physical count are excluded.</p>
    <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
      {units.map(group => <div key={group.unit} style={{ background: '#f5ecdf', borderRadius: '8px', padding: '12px', overflowWrap: 'anywhere' }}>
        <dt style={{ fontWeight: 700 }}>{group.unit}</dt>
        <dd style={{ margin: 0 }}>{group.total === null ? 'Not recorded' : `${group.total.toLocaleString('en-IN')} ${group.unit}`} · {group.recorded} of {group.products} products counted{group.unknown > 0 ? ` · ${group.unknown} awaiting count` : ''}</dd>
      </div>)}
    </dl>
  </details>
}

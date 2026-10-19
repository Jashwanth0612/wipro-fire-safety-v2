export function stockPreview(stock, kind, value) {
  const quantity = Number(value)
  if (value === '' || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000 || (kind !== 'count' && quantity === 0)) return { error: 'Enter a valid whole-number quantity.' }
  if (!['receipt', 'dispatch', 'count'].includes(kind)) return { error: 'Choose a stock action.' }
  if (kind !== 'count' && stock == null) return { error: 'Record an opening physical count first.' }
  const balance = kind === 'count' ? quantity : stock + (kind === 'receipt' ? quantity : -quantity)
  if (balance < 0) return { error: 'Dispatch exceeds available stock.' }
  if (balance > 1000000) return { error: 'Balance exceeds the supported stock limit.' }
  return { balance }
}

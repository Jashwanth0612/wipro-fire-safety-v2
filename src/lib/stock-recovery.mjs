// A tab-scoped outbox for uncertain stock writes. Contains no credentials.
// JWT subject is only a storage namespace: API/RLS still authorize every request.
const PREFIX = 'wipro:pending-stock:v1:'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const storageError = () => new Error('Stock recovery is unavailable in this tab. Enable browser session storage and reload before recording stock. Check movement history before repeating an earlier entry.')

function storageKey(token) {
  try {
    const encoded = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
    const { sub } = JSON.parse(atob(encoded))
    if (UUID.test(sub)) return PREFIX + sub.toLowerCase()
  } catch { /* Invalid sessions must not share an outbox. */ }
  throw new Error('Sign in again before recording stock; the staff session could not be identified.')
}
function validBody(body) {
  return body && UUID.test(body.request_id) && UUID.test(body.product_id)
    && ['receipt', 'dispatch', 'count'].includes(body.kind)
    && Number.isInteger(body.quantity) && body.quantity >= (body.kind === 'count' ? 0 : 1) && body.quantity <= 1000000
    && (body.expected_stock === null || (Number.isInteger(body.expected_stock) && body.expected_stock >= 0 && body.expected_stock <= 1000000))
    && typeof body.reference === 'string' && body.reference.trim().length > 0 && body.reference.length <= 120
    && typeof body.note === 'string' && body.note.length <= 500
    && Object.keys(body).sort().join(',') === 'expected_stock,kind,note,product_id,quantity,reference,request_id'
}
const browserStorage = () => window.sessionStorage

export function loadPendingStock(token, getStorage = browserStorage) {
  const key = storageKey(token)
  try {
    const raw = getStorage().getItem(key)
    if (raw === null) return null
    const saved = JSON.parse(raw)
    if (saved.version !== 1 || !validBody(saved.body)) throw storageError()
    return saved.body
  } catch { throw storageError() }
}

function persist(token, body, getStorage) {
  if (!validBody(body)) throw new Error('Stock entry is incomplete. Review the quantity and reference before recording.')
  const pending = loadPendingStock(token, getStorage)
  if (pending && JSON.stringify(pending) !== JSON.stringify(body)) {
    throw new Error('An earlier stock entry still needs confirmation. Reload this page to recover it before recording another.')
  }
  try {
    const store = getStorage()
    const serialized = JSON.stringify({ version: 1, body })
    store.setItem(storageKey(token), serialized)
    if (store.getItem(storageKey(token)) !== serialized) throw storageError()
  } catch { throw storageError() }
}
function clear(token, body, getStorage) {
  const pending = loadPendingStock(token, getStorage)
  if (pending && pending.request_id !== body.request_id) throw storageError()
  try {
    const store = getStorage()
    store.removeItem(storageKey(token))
    if (store.getItem(storageKey(token)) !== null) throw storageError()
  } catch { throw storageError() }
}

export async function recordRecoverableMovement({ token, body, request, getStorage = browserStorage }) {
  // Persist and verify before sending: storage failure must not cause a stock write.
  persist(token, body, getStorage)
  let result
  try {
    result = await request(body)
    if (!result?.id || result.request_id !== body.request_id || !Number.isInteger(result.balance) || result.balance < 0 || result.balance > 1000000) {
      throw new Error('The server did not confirm this movement. Retry the same entry safely.')
    }
  } catch (error) {
    // These responses conclusively reject this attempt. Timeouts, auth expiry,
    // rate limits, server errors and malformed responses retain the exact request.
    if ([400, 404, 409, 422].includes(error.status)) clear(token, body, getStorage)
    throw error
  }
  clear(token, body, getStorage)
  return result
}

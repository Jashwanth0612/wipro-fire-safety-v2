import test from 'node:test'
import assert from 'node:assert/strict'
import { apiRequest, normalizeApiBase, submitInquiry } from '../src/lib/api.js'
const form = { name:' Test ', email:'test@example.com', phone:'9999999999', service:'amc', message:'Quote please' }
const json = (body, status = 200) => new Response(JSON.stringify(body), {status,headers:{'content-type':'application/json'}})
test('accepts both legacy host and API environment values', () => {
  assert.equal(normalizeApiBase('https://example.com/'), 'https://example.com/api')
  assert.equal(normalizeApiBase('https://example.com/api/'), 'https://example.com/api')
  assert.equal(normalizeApiBase(), '/api')
})
test('HTML from SPA fallback or Render loading screen cannot report enquiry success', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => new Response('<html>Loading</html>', {status:200,headers:{'content-type':'text/html'}})
    await assert.rejects(submitInquiry(form, []), /could not confirm/)
    globalThis.fetch = async () => json({})
    await assert.rejects(submitInquiry(form, []), /did not confirm/)
    globalThis.fetch = async () => json({id:'inquiry-123'})
    assert.equal((await submitInquiry(form, [])).id, 'inquiry-123')
  } finally { globalThis.fetch = original }
})
test('authenticated requests preserve token and propagate rejected status saves', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/contact/123/status')
      assert.equal(options.headers.Authorization, 'Bearer test-token')
      assert.equal(options.cache, 'no-store')
      return json({detail:'Token expired'}, 401)
    }
    await assert.rejects(apiRequest('/contact/123/status', {method:'PATCH',token:'test-token',body:{status:'contacted'}}), error => error.status === 401)
  } finally { globalThis.fetch = original }
})

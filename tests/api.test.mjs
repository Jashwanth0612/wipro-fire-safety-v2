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

test('timeout covers response-body reading and explains uncertain stock writes', async () => {
 const original=globalThis.fetch
 try {
  globalThis.fetch=async (_url,{signal})=>({ok:true,status:200,headers:new Headers({'content-type':'application/json'}),json:()=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}))})
  await assert.rejects(apiRequest('/inventory/movements',{method:'POST',body:{},timeout:5}),error=>error.code==='REQUEST_TIMEOUT' && error.status===undefined && error.message.includes('may already be saved') && error.message.includes('Retry same entry safely'))
 } finally {globalThis.fetch=original}
})

test('network failures are readable and never automatically resubmit writes', async () => {
 const original=globalThis.fetch
 let calls=0
 try {
  globalThis.fetch=async()=>{calls++;throw new TypeError('Failed to fetch')}
  await assert.rejects(apiRequest('/contact',{method:'POST',body:{}}),error=>error.code==='NETWORK_ERROR' && error.message.includes('Check the result before submitting again') && error.status===undefined)
  assert.equal(calls,1)
  await assert.rejects(apiRequest('/products'),error=>error.code==='NETWORK_ERROR' && error.message.includes('check your connection'))
 } finally {globalThis.fetch=original}
})

test('caller cancellation remains distinct from service timeouts', async () => {
 const original=globalThis.fetch, controller=new AbortController()
 try {
  globalThis.fetch=async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}))
  const request=apiRequest('/products',{signal:controller.signal,timeout:100})
  controller.abort()
  await assert.rejects(request,error=>error.name==='AbortError' && error.code!=='REQUEST_TIMEOUT')
 } finally {globalThis.fetch=original}
})

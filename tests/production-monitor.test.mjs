import test from 'node:test'
import assert from 'node:assert/strict'
import { checkProduction } from '../scripts/check-production.mjs'

function healthy(url) {
 const path = new URL(url).pathname
 if (path === '/api/health') return Response.json({status:'ready',provider:'supabase',database:'connected',admin:'configured'})
 if (path === '/api/products') return Response.json([{id:'fixture', title:'Fixture', category:'Safety Equipment'}])
 if (path === '/api/contact' || path === '/api/inventory/movements') return new Response(null,{status:401,headers:{'cache-control':'private, no-store'}})
 if (path.endsWith('.js')) return new Response('/* fixture */',{headers:{'content-type':'application/javascript'}})
 if (path.endsWith('.css')) return new Response('body{}',{headers:{'content-type':'text/css'}})
 return new Response('<div id="root"></div><script src="/assets/test.js"></script><link href="/assets/test.css">', {headers:{'content-type':'text/html','x-content-type-options':'nosniff','x-frame-options':'DENY','strict-transport-security':'max-age=31536000','content-security-policy':"object-src 'none'; frame-ancestors 'none'"}})
}
test('healthy site passes without credentials or write requests', async () => {
 const results = await checkProduction(async (url, options) => {
   assert.equal(options.redirect,'error')
   assert.equal(options.method,undefined)
   assert.equal(options.headers.Authorization,undefined)
   return healthy(url)
 })
 assert.equal(results.length,13)
 assert.ok(results.every(result => result.ok))
})
test('monitor detects degraded DB, exposed admin API and HTML masquerading as JS',async () => {
 const results = await checkProduction(async url => {
   if(url.endsWith('/api/health')) return Response.json({status:'degraded'})
   if(url.endsWith('/api/contact')) return Response.json([{private:'must never appear in output'}])
   if(url.endsWith('.js')) return new Response('<html>',{headers:{'content-type':'text/html'}})
   return healthy(url)
 })
 assert.deepEqual(results.filter(r=>!r.ok).map(r=>r.path),['/assets/test.js','/api/health','/api/contact'])
 assert.ok(!JSON.stringify(results).includes('private'))
})
test('network failure is reported and subsequent checks still run',async () => {
 const results = await checkProduction(async url => {
   if(url.endsWith('/about')) throw new Error('sensitive upstream details')
   return healthy(url)
 })
 assert.deepEqual(results.filter(r=>!r.ok),[{path:'/about',ok:false}])
})

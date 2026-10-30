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

test('monitor traverses lazy imports, shared dependencies and preload CSS once', async () => {
 const seen = []
 const results = await checkProduction(async url => {
   const path = new URL(url).pathname
   seen.push(path)
   const source = {
     '/assets/test.js': 'import("./About-abc.js"); const deps=["assets/page-def.css","assets/About-abc.js"];',
     '/assets/About-abc.js': 'import "./shared-xyz.js"; import("./test.js");',
     '/assets/shared-xyz.js': 'export const fixture=true;',
   }[path]
   return source ? new Response(source,{headers:{'content-type':'text/javascript'}}) : healthy(url)
 })
 assert.ok(results.every(r=>r.ok))
 for (const path of ['/assets/About-abc.js','/assets/shared-xyz.js','/assets/page-def.css','/assets/test.js']) {
   assert.equal(seen.filter(p=>p===path).length,1)
 }
})

test('missing or HTML lazy chunks fail while staff denial checks still run', async () => {
 for (const broken of [new Response('missing',{status:404}), new Response('<!doctype html>',{headers:{'content-type':'application/javascript'}})]) {
   const results = await checkProduction(async url => {
     if(url.endsWith('/test.js')) return new Response('import("./missing.js")',{headers:{'content-type':'text/javascript'}})
     if(url.endsWith('/missing.js')) return broken
     return healthy(url)
   })
   assert.deepEqual(results.filter(r=>!r.ok),[{path:'/assets/missing.js',ok:false}])
   assert.ok(results.find(r=>r.path==='/api/inventory/movements').ok)
 }
})

test('asset discovery ignores external, traversal, query and non-asset references', async () => {
 const seen=[]
 const results=await checkProduction(async url=>{
   seen.push(url)
   if(url.endsWith('/test.js')) return new Response('import("https://other.test/secret.js"); import("../api/private.js"); const x=["/assets/../private.js","/assets/key.js?token=private","/api/private.js"];',{headers:{'content-type':'application/javascript'}})
   return healthy(url)
 })
 assert.equal(seen.length,13)
 assert.ok(results.every(r=>r.ok))
})

test('excessive chunk graph fails explicitly rather than silently passing incomplete coverage', async () => {
 let assets=0
 const results=await checkProduction(async url=>{
   if(url.includes('/assets/')) assets++
   if(url.endsWith('/test.js')) return new Response(Array.from({length:70},(_,i)=>`import("./page-${i}.js")`).join(';'),{headers:{'content-type':'application/javascript'}})
   return healthy(url)
 })
 assert.equal(assets,64)
 assert.deepEqual(results.filter(r=>!r.ok),[{path:'asset traversal limit',ok:false}])
 assert.ok(results.find(r=>r.path==='/api/health').ok)
})

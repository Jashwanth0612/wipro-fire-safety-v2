import { pathToFileURL } from 'node:url'

export const PRODUCTION = 'https://wipro-fire-safety-v2.vercel.app'

// Read-only, credential-free checks. Never log response bodies or enquiry data.
export async function checkProduction(fetcher = fetch) {
  const results = []
  let home = ''
  async function check(path, validate) {
    try {
      const response = await fetcher(`${PRODUCTION}${path}`, {
        redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'Wipro-Production-Health/1.0' },
      })
      await validate(response)
      results.push({ path, ok: true })
    } catch {
      // Omit raw exceptions: upstream errors may contain private response data.
      results.push({ path, ok: false })
    }
  }
  function require(condition) { if (!condition) throw new Error('Check failed') }
  await check('/', async response => {
    require(response.status === 200)
    require(response.headers.get('content-type')?.includes('text/html'))
    require(response.headers.get('x-content-type-options') === 'nosniff')
    require(response.headers.get('x-frame-options') === 'DENY')
    require(response.headers.get('strict-transport-security')?.includes('max-age='))
    const csp = response.headers.get('content-security-policy') || ''
    require(csp.includes("object-src 'none'") && csp.includes("frame-ancestors 'none'"))
    home = await response.text()
    require(/id=["']root["']/.test(home))
  })
  for (const path of ['/about', '/products', '/services', '/contact', '/clients', '/admin/login']) {
    await check(path, async response => {
      require(response.status === 200 && response.headers.get('content-type')?.includes('text/html'))
      require(/id=["']root["']/.test(await response.text()))
    })
  }
  // Check the real hashed entry bundles, not a guessed filename returning SPA HTML.
  const assets = [...new Set([...home.matchAll(/(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css))["']/g)].map(match => match[1]))]
  if (!assets.some(path => path.endsWith('.js')) || !assets.some(path => path.endsWith('.css'))) {
    results.push({ path: 'entry bundles', ok: false })
  }
  // Traverse only literal build-asset references, never arbitrary URLs or API paths.
  // Vite emits relative imports and root-relative preload dependency lists.
  const queued = new Set(assets)
  const queue = [...queued]
  const limit = 64
  for (let index = 0; index < queue.length && index < limit; index++) {
    const path = queue[index]
    await check(path, async response => {
      const type = response.headers.get('content-type') || ''
      require(response.status === 200 && (path.endsWith('.css') ? type.includes('text/css') : /javascript/.test(type)))
      const body = await response.text()
      require(body.trim().length > 0 && !/^\s*</.test(body))
      if (path.endsWith('.js')) {
        for (const match of body.matchAll(/["']((?:\.\/|\/assets\/|assets\/)[A-Za-z0-9_.-]+\.(?:js|css))["']/g)) {
          const reference = match[1]
          const asset = reference.startsWith('assets/') ? `/${reference}` : new URL(reference, `${PRODUCTION}${path}`).pathname
          if (!/^\/assets\/[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:js|css)$/.test(asset) || queued.has(asset)) continue
          queued.add(asset)
          queue.push(asset)
        }
      }
    })
  }
  if (queue.length > limit) results.push({ path: 'asset traversal limit', ok: false })
  await check('/api/health', async response => {
    require(response.status === 200)
    const data = await response.json()
    require(data.status === 'ready' && data.provider === 'supabase' && data.database === 'connected' && data.admin === 'configured')
  })
  await check('/api/products', async response => {
    require(response.status === 200)
    const data = await response.json()
    require(Array.isArray(data) && data.length > 0)
    require(data.every(item => item.id && typeof item.title === 'string' && item.title.trim() && typeof item.category === 'string'))
  })
  for (const path of ['/api/contact', '/api/inventory/movements']) {
    await check(path, async response => {
      require(response.status === 401 || response.status === 403)
      require(response.headers.get('cache-control')?.includes('no-store'))
      // Do not read or print a protected response body.
    })
  }
  return results
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = await checkProduction()
  console.log(`Wipro production checks · ${new Date().toISOString()}`)
  for (const result of results) console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.path}`)
  console.log(`${results.filter(result => result.ok).length}/${results.length} checks passed`)
  process.exitCode = results.some(result => !result.ok) ? 1 : 0
}

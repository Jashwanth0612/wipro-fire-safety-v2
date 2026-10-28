// Optional browser regression check against `npm run build && npm run preview`.
// Install Playwright in a temporary directory, then set PLAYWRIGHT_MODULE to its
// index.mjs. Only localhost is accepted; API responses below are synthetic.
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const origin = process.env.PREVIEW_URL || 'http://127.0.0.1:4173'
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Use a local preview, never production')
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
let passed = 0
async function check(name, run) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  await context.route('**/api/**', route => {
    assert.equal(route.request().method(), 'GET', 'Browser checks must not write business data')
    const path = new URL(route.request().url()).pathname
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(path.endsWith('/health') ? { status: 'ready', provider: 'supabase', database: 'connected', admin: 'configured' } : []) })
  })
  const page = await context.newPage()
  try { await run(page); console.log(`PASS ${name}`); passed++ }
  finally { await context.close() }
}
try {
  await check('homepage excludes secondary route downloads; navigation loads About', async page => {
    const scripts = []
    page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()) })
    await page.goto(origin)
    await page.locator('[data-testid="home-page"]').waitFor()
    assert.ok(!scripts.some(url => /\/(Admin|About-|Products-|Services-|Contact-|AllClients-|CityClients-)/.test(url)))
    const download = page.waitForRequest(request => /\/About-/.test(request.url()))
    await page.locator('a[href="/about"]').first().click()
    await download
    await page.getByRole('heading', { name: /South India.*trusted/i }).waitFor()
    assert.ok(scripts.some(url => /\/About-/.test(url)))
    assert.match(await page.locator('main').innerText(), /South India/i)
  })
  for (const route of ['/about', '/products', '/services', '/contact', '/clients', '/clients/hyderabad', '/admin/login', '/missing-page']) {
    await check(`direct entry ${route}`, async page => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(origin + route)
      await page.locator('main h1').waitFor()
      assert.ok(!(await page.locator('main').innerText()).includes('This page could not be loaded'))
      assert.deepEqual(errors, [])
    })
  }
  for (const route of ['/admin', '/admin/dashboard', '/admin/products']) {
    await check(`anonymous redirect ${route}`, async page => {
      const scripts = []
      page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()) })
      await page.goto(origin + route)
      await page.waitForURL('**/admin/login')
      await page.locator('input[type="password"]').waitFor()
      assert.ok(!scripts.some(url => /\/Admin(Dashboard|Products)-/.test(url)), 'Signed-out visitors must not download or mount staff screens')
    })
  }
  for (const [route, heading] of [['/admin/dashboard', 'Admin Dashboard'], ['/admin/products', 'Product & Stock Manager']]) {
    await check(`local synthetic session can open ${route}`, async page => {
      await page.addInitScript(() => localStorage.setItem('admin_token', 'local-test-only'))
      await page.goto(origin + route)
      await page.getByRole('heading', { name: heading, exact: true }).waitFor()
      assert.equal(new URL(page.url()).pathname, route)
    })
    await check(`server rejection still redirects ${route}`, async page => {
      await page.addInitScript(() => localStorage.setItem('admin_token', 'local-test-only'))
      await page.route('**/api/' + (route.endsWith('products') ? 'products' : 'contact'), route => route.fulfill({status:403, contentType:'application/json', body:'{"detail":"Forbidden"}'}))
      await page.goto(origin + route)
      await page.waitForURL('**/admin/login')
      await page.locator('input[type="password"]').waitFor()
      assert.equal(await page.evaluate(() => localStorage.getItem('admin_token')), null)
    })
  }
  await check('slow Contact chunk shows feedback and preserves enquiry hash scrolling', async page => {
    let release
    const gate = new Promise(resolve => { release = resolve })
    await page.route('**/assets/Contact-*.js', async route => { await gate; await route.continue() })
    await page.goto(origin + '/contact#inquiry', { waitUntil: 'domcontentloaded' })
    await page.getByRole('status').filter({ hasText: 'Loading page' }).waitFor()
    release()
    await page.locator('#inquiry').waitFor()
    await page.waitForFunction(() => window.scrollY > 100 && Math.abs(document.getElementById('inquiry').getBoundingClientRect().top) < 160)
  })
  await check('failed route download offers recovery and leaves home navigation working', async page => {
    await page.route('**/assets/Services-*.js', route => route.abort())
    await page.goto(origin + '/services')
    await page.getByRole('heading', { name: 'This page could not be loaded' }).waitFor()
    await page.getByRole('button', { name: 'Reload page', exact: true }).waitFor()
    await page.getByRole('link', { name: 'Back to home', exact: true }).click()
    await page.locator('[data-testid="home-page"]').waitFor()
  })
  await check('mobile direct Contact entry renders without horizontal overflow', async page => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(origin + '/contact#inquiry')
    await page.locator('#inquiry').waitFor()
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  })
  console.log(`${passed} browser route checks passed; synthetic API data only`)
} finally { await browser.close() }

// Optional browser regression check against `npm run build && npm run preview`.
// Install Playwright in a temporary directory, then set PLAYWRIGHT_MODULE to its
// index.mjs. Only localhost is accepted; API responses below are synthetic.
import assert from 'node:assert/strict'
import { PRODUCTS } from '../src/data/products.js'
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
    if (path.endsWith('/admin/session')) return route.fulfill({status:401,contentType:'application/json',body:'{"detail":"Sign in"}'})
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
  await check('public products page through every item once, with Previous and final-page limits', async page => {
    await page.goto(origin + '/products')
    const pager = page.getByRole('navigation', { name: 'Product catalogue pages' })
    await pager.waitFor()
    assert.equal(await page.getByRole('combobox', { name: 'Sort products' }).inputValue(), 'name')
    assert.equal(await pager.getByRole('button', { name: 'Previous' }).isEnabled(), false)
    const seen = []
    for (let number = 1; number <= 5; number++) {
      await page.getByRole('status').filter({ hasText: `Showing ${(number - 1) * 9 + 1}–${Math.min(number * 9, 40)} of 40 products` }).waitFor()
      const names = await page.locator('.product-card .product-image').evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))
      assert.equal(names.length, number === 5 ? 4 : 9)
      seen.push(...names)
      if (number < 5) await pager.getByRole('button', { name: 'Next' }).click()
    }
    assert.equal(await pager.getByRole('button', { name: 'Next' }).isEnabled(), false)
    assert.equal(new Set(seen).size, 40)
    assert.deepEqual([...seen].sort(), PRODUCTS.map(product => `View ${product.title}, ${product.subtitle}`).sort())
    await pager.getByRole('button', { name: 'Previous' }).click()
    await page.getByRole('status').filter({ hasText: 'Showing 28–36 of 40 products' }).waitFor()
    assert.equal(await page.getByRole('combobox', { name: 'Product page', exact: true }).inputValue(), '4')
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Browse products')
  })
  await check('product search, category and sort changes reset a later page; shortlist survives paging', async page => {
    await page.goto(origin + '/products')
    const picker = page.getByRole('combobox', { name: 'Product page', exact: true })
    await picker.selectOption('5')
    const chosen = page.locator('.product-card').first()
    const title = await chosen.locator('h2').innerText()
    await chosen.getByRole('button', { name: 'Details', exact: true }).click()
    await page.getByRole('dialog').getByRole('heading', { name: title, exact: true }).waitFor()
    await page.getByRole('button', { name: 'Close product details' }).click()
    await chosen.getByRole('button', { name: /^Add to quote:/ }).click()
    await picker.selectOption('1')
    await picker.selectOption('5')
    assert.equal(await page.locator('.product-card').first().getByRole('button', { name: /^Added to quote:/ }).isEnabled(), false)
    await page.getByRole('searchbox', { name: 'Search products or model numbers' }).fill('VFPA4')
    await page.getByRole('status').filter({ hasText: 'Showing 1–1 of 1 product' }).waitFor()
    assert.equal(await page.getByRole('navigation', { name: 'Product catalogue pages' }).count(), 0)
    await page.getByRole('button', { name: 'Clear search', exact: true }).click()
    await picker.selectOption('5')
    await page.getByRole('button', { name: /^Fire Extinguishers/ }).click()
    await page.getByRole('status').filter({ hasText: 'Showing 1–9 of 12 products' }).waitFor()
    assert.equal(await picker.inputValue(), '1')
    await picker.selectOption('2')
    await page.getByRole('combobox', { name: 'Sort products' }).selectOption('featured')
    assert.equal(await picker.inputValue(), '1')
    await page.getByRole('searchbox', { name: 'Search products or model numbers' }).fill('no-match-9382')
    await page.getByRole('heading', { name: 'No matching products' }).waitFor()
    assert.equal(await page.locator('.product-card').count(), 0)
    await page.getByRole('button', { name: 'Show all products', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Showing 1–9 of 40 products' }).waitFor()
    assert.equal(await page.getByRole('combobox', { name: 'Sort products' }).inputValue(), 'name')
    await page.getByRole('region', { name: 'Your quote shortlist' }).getByText('1 product in your quote').waitFor()
  })
  await check('mobile product pagination stays compact and usable when the catalogue API is offline', async page => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.route('**/api/products', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }))
    await page.goto(origin + '/products')
    await page.getByText('Showing our brochure range.', { exact: false }).waitFor()
    const pager = page.getByRole('navigation', { name: 'Product catalogue pages' })
    await pager.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('status').filter({ hasText: 'Showing 10–18 of 40 products' }).waitFor()
    assert.equal(await page.locator('.product-card').count(), 9)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    const heading = await page.getByRole('heading', { name: 'Browse products', exact: true }).boundingBox()
    assert.ok(heading.y >= 100 && heading.y < 180, `Page changes return to the catalogue below the sticky header (heading y=${heading.y})`)
  })
  for (const [route, heading] of [['/admin/dashboard', 'Admin Dashboard'], ['/admin/products', 'Product & Stock Manager']]) {
    await check(`local synthetic session can open ${route}`, async page => {
      await page.route('**/api/admin/session', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user_id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',csrf_token:'synthetic-csrf',expires_at:Math.floor(Date.now()/1000)+3600})}))
      await page.goto(origin + route)
      await page.getByRole('heading', { name: heading, exact: true }).waitFor()
      assert.equal(new URL(page.url()).pathname, route)
    })
    await check(`server rejection still redirects ${route}`, async page => {
      await page.route('**/api/admin/session', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user_id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',csrf_token:'synthetic-csrf',expires_at:Math.floor(Date.now()/1000)+3600})}))
      await page.route('**/api/' + (route.endsWith('products') ? 'admin/products' : 'contact'), route => route.fulfill({status:403, contentType:'application/json', body:'{"detail":"Forbidden"}'}))
      await page.goto(origin + route)
      await page.waitForURL('**/admin/login')
      await page.locator('input[type="password"]').waitFor()
      assert.equal(await page.evaluate(() => localStorage.getItem('admin_token')), null)
    })
  }
  await check('stored injection renders as text and bundled export downloads', async page => {
    await page.route('**/api/admin/session', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user_id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',csrf_token:'synthetic-csrf',expires_at:Math.floor(Date.now()/1000)+3600})}))
    const malicious='<img src=x onerror=window.injected=true>'
    await page.route('**/api/contact', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:'test',name:malicious,message:malicious,email:'test@example.invalid',phone:'9999999999',status:'pending',created_at:new Date().toISOString()}])}))
    await page.goto(origin+'/admin/dashboard')
    await page.getByText(malicious,{exact:true}).first().waitFor()
    assert.equal(await page.evaluate(()=>window.injected),undefined)
    assert.equal(await page.locator('table img').count(),0)
    await page.goto(origin+'/admin/products')
    await page.getByRole('heading',{name:'Product & Stock Manager'}).waitFor()
    const download=page.waitForEvent('download')
    await page.getByRole('button',{name:/Export Excel/}).click()
    assert.match((await download).suggestedFilename(),/Wipro_Stock_Report_.*\.xlsx/)
    assert.equal(await page.locator('script[src*=cdnjs]').count(),0)
  })
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

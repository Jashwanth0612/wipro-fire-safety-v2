# Route loading verification

Secondary routes use module-level React.lazy imports. Home stays in the entry bundle; Navbar, Footer and quote context persist. Each page wrapper supplies Suspense feedback and an error boundary. Navigation remounts the boundary; failed chunks offer a user-controlled reload and a home link. There is no automatic reload or write retry. Scroll handling is inside Suspense so /contact#inquiry waits for the actual form. Unknown pages retain scroll-to-top behavior.

## Reproduce locally

Run the existing frontend/API tests and build first:

```sh
node --test tests/*.test.mjs
python -m pytest backend/tests -q
npm run build
npm run preview -- --host 127.0.0.1
```

In another terminal, install browser tooling outside the repository and run the optional browser suite (tested with Playwright 1.56.1):

```sh
npm install --prefix /tmp/wipro-browser-test --no-audit --no-fund playwright@1.56.1
node /tmp/wipro-browser-test/node_modules/playwright/cli.js install chromium --only-shell
PLAYWRIGHT_MODULE=/tmp/wipro-browser-test/node_modules/playwright/index.mjs node scripts/check-route-loading.mjs
```

The script only accepts loopback preview URLs. All API responses are synthetic and only GET requests are allowed. It checks deferred downloads, real link navigation, direct entries, anonymous admin redirects, delayed Contact loading and hash scrolling, failed-download recovery, and a narrow Contact viewport. It does not sign in or change stock. It is an optional local check, not yet part of hosted CI.

## Measurement and limits

26 October entry JS: 555.53 kB / 168.05 kB gzip.
27 October entry JS: 449.00 kB / 143.27 kB gzip (about 19.2% / 14.7% smaller).
These are build asset sizes, not claims about page-load time or Core Web Vitals. Secondary routes incur a first-visit request; already-loaded modules are cached for that browser session. CSS remains global. Full mobile/accessibility, authenticated admin workflows and real-user performance remain separate checks.

Production smoke now follows literal Vite asset references from the entry JavaScript through deferred/shared JS and preload CSS. It checks status, content type and nonempty non-HTML content, deduplicates cycles, and fails explicitly above 64 assets. Discovery only permits simple same-origin /assets/ filenames; it does not execute downloaded JavaScript or follow external URLs. This verifies asset availability, not rendering or business behavior: a public browser route traversal is still required after a route-loading release. If bundler output syntax changes, update discovery fixtures and compare coverage with the build assets. If regression occurs, revert the route-loading app commit in Git and redeploy; no database rollback is necessary. Original stock recovery remains in sessionStorage and is unaffected by route loading.

Implementation references: [React lazy](https://react.dev/reference/react/lazy), [Suspense](https://react.dev/reference/react/Suspense).

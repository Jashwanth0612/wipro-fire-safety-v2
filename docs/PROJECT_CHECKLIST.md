# Wipro Fire & Safety V2 — delivery checklist

Last reviewed: 30 October 2026. Owner: Jashwanth. Scope: V2 only; preserve V1.

## How to use this document

At the start of every project session, read this checklist and the latest code/deployment. Verify evidence before checking an item off. Complete the highest-priority actionable task, test it, then record the date, commit and result. A deployed screen alone does not prove a workflow works. Leave items blocked by missing information unchecked and name the exact dependency. Never invent stock, customers, certificates, reviews or specifications. Daily autonomous improvement work is scheduled around 10am India time, starting 20 October 2026, subject to connected-app access. The owner has authorized choosing and completing routine improvements without waiting for a further “continue”. Treat this document as an execution queue: implement, verify, record evidence, and add newly discovered issues. If one item needs business input, record the dependency and work on another actionable item. Scheduled runs are not uninterrupted background execution.

Status: `[x]` verified completed; `[ ]` pending. Implementation awaiting live verification stays pending. The previous 80% estimate was a judgement, not a measured acceptance score.

## Ongoing — whole-site monitoring and improvement

The daily task covers the full website and backend, not only inventory. Confirmed outages, security regressions and broken customer journeys take priority over new features. Each run records timestamped evidence and unavailable checks, then fixes actionable issues.

- [ ] On each run, check production availability, API/database health, deployment failures and available error logs.
- [ ] Check key public pages/assets and confirm anonymous requests cannot access staff-only data; use non-destructive checks.
- [ ] Review dependency advisories, security headers, authentication/authorization and database policies after relevant changes; never include secrets or customer data in reports.
- [ ] Rotate deeper mobile, accessibility, performance, SEO and business-content reviews; add discovered issues to this queue.
- [ ] Establish and verify dedicated uptime/error alerts, including a controlled alert test and recovery notification. Daily scheduled reviews are active; continuous real-time monitoring is not yet established.

## P0 — inventory and daily operations

- [x] Supabase V2 connection and staff allowlist established (15 Oct: health ready; RLS transaction tests passed).
- [x] Original 40 catalogue products seeded without invented quantities (15 Oct).
- [x] Prominent top Admin login text removed; account icon retained (15 Oct, commit 43de28e).
- [x] Deliver audited stock receipts, dispatches and physical counts; update balance atomically. (19 Oct: deployed; automated tests passed; owner browser workflow check pending below.)
- [x] Verify duplicate submission cannot count the same movement twice. (19 Oct: deployed; automated tests passed; owner browser workflow check pending below.)
- [ ] Verify concurrent stock edits under simultaneous live requests. Row locks and expected-count checks implemented; stale-count and over-dispatch SQL tests passed, but parallel live stress test not run.
- [x] Verify anonymous and ordinary users cannot read movements or mutate stock. (19 Oct: deployed; automated tests passed; owner browser workflow check pending below.)
- [x] Add searchable inventory, low-stock and opening-count filters; retain Excel export. (19 Oct: deployed; automated tests passed; owner browser workflow check pending below.)
- [x] Verify owner authenticated access, product list and history loading through the live browser (19 Oct: user completed login; 40 products rendered; history showed its empty state without an error).
- [ ] Verify product creation, receipt, dispatch, count and Excel export through the live browser. Authentication blocker resolved; mutation workflow not yet exercised in browser. Preserve real stock balances.
- [x] Fix category-filter coverage: filters and add-product choices include every stored category, including Safety Equipment. Regression test preserves original category names (19 Oct).
- [ ] Record actual opening quantities for every stocked product. **Needs business input:** physical count by owner/father; no assumed zeros.
- [ ] Configure meaningful minimum-stock thresholds for each product. **Needs business input:** reorder quantities and lead times.
- [ ] Create father's separate staff account. **Needs input:** his email, user-controlled password setup and explicit account grant.
- [x] Compact admin catalogue: 8 products per page by default, full-inventory search/category/status filters, separate stock-level cards, and expandable descriptions. Stock-entry workflow and full Excel export retained (20 Oct; tests/build passed; Vercel production READY at 4aec98b).
- [ ] Multi-item delivery entry and CSV import with preview, validation and duplicate-document detection.
- [ ] Product variant/SKU and barcode strategy based on real manufacturer codes (do not invent scan codes).
- [ ] Supplier register, purchase orders and reorder suggestions; orders must be reviewed before sending.
- [ ] Returns/damage movements and stock reconciliation report.
- [ ] Archived product view and restore action.
- [x] Correct exported category summaries: unknown stock is not zero, mixed units are separated, and partial count coverage is explicit (25 Oct; calculation tests passed). Actual authenticated Excel download remains pending.
- [x] Replace the stock-manager mixed-unit aggregate with Products Counted and a collapsed unit-by-unit summary (26 Oct; calculation and server-render checks passed). Live authenticated visual verification remains pending.

## P0 — enquiries and workflow verification

- [x] Public enquiry is persisted; unauthenticated enquiry reads denied (15 Oct labelled system test).
- [ ] Verify real staff follow-up/status changes and dashboard totals in browser.
- [ ] Add owner assignment, due dates, internal notes and overdue enquiry views.
- [ ] Add enquiry notifications with retry/deduplication. **Needs input:** destination(s), sending provider/domain and explicit permission to send notifications.
- [ ] Add acknowledgement email only with approved wording, sender and sending authorization.
- [ ] Distinguish enquiry/quote from sale: enquiries must never automatically deduct stock.
- [ ] Quote-to-dispatch workflow with explicit staff confirmation; cancellation must not silently erase history.

## P1 — security and reliability

- [x] Staff actions use user tokens and database authorization; no service key in frontend (15 Oct).
- [x] Public signup disabled; staff membership cannot be self-granted (15 Oct).
- [x] Input/body limits, generic errors, cache/security headers and dependency updates implemented (71447ed; 15 Oct tests).
- [ ] Recheck dependencies and access policies after each backend change.
- [ ] Test password recovery with approved sender/redirect and enable staff MFA where supported.
- [ ] Enable leaked-password protection when an approved Pro-or-higher plan is available. Current organization is Free; no upgrade authorized.
- [x] Restrict internal auto-RLS event-trigger function execution to privileged roles (19 Oct migration 20261019174849). Anonymous/authenticated execution denied; owner execution, enabled event trigger and stock RPC preserved; advisor warning cleared.
- [x] Replace browser token storage with Secure HttpOnly Strict cookies, server revocation and CSRF protection (30 Oct; local integrated browser/API test, hosted regressions and live anonymous checks passed; real owner sign-in remains pending).
- [x] Shared atomic rate limits for login, enquiries and chat (30 Oct; database concurrency/access tests passed). Additional edge bot challenges are not configured.
- [ ] Verify backup schedule/retention and perform restore drill in an isolated database. **Needs access/plan details; no paid upgrades assumed.**
- [x] Implement credential-free production smoke checks and an hourly GitHub Actions workflow with safe pass/fail summaries (19 Oct). Local live run: 13/13 passed. GitHub Production health run 39297017241 succeeded.
- [ ] Complete error monitoring, notification delivery and recovery alerts; a scheduled smoke checker alone does not satisfy this item.
- [x] Extend production smoke coverage to dynamically imported route chunks (30 Oct, 5704d4b): recursive same-origin asset discovery, content validation, deduplication and explicit traversal-limit failure. All 18 current build JS/CSS assets covered; live checker passed 29/29. Rendering remains a separate browser check.
- [x] Pin Playwright and Ubuntu 24.04; hosted CI now runs the Chromium regression suite alongside frontend/API/build and dependency checks (30 Oct, run 41039498960 passed).
- [x] Preserve unconfirmed stock requests across refresh and same-account sign-in in the same tab; verify replay and storage-failure behavior with automated tests (23 Oct). See docs/STOCK_RECOVERY.md. Live authenticated browser verification remains pending.
- [x] Add readable timeout and connection-loss feedback without automatic write retries; distinguish caller cancellation and preserve uncertain stock requests (24 Oct, automated request tests).
- [ ] Test session expiry, offline responses, retries, timeout feedback and safe recovery end-to-end in the authenticated browser.
- [ ] Extend uncertain-stock recovery across closed tabs/devices with server-side draft reconciliation; current recovery is deliberately limited to the original browser tab.
- [x] Add GitHub Actions build, API and frontend/inventory tests (19 Oct, `.github/workflows/quality.yml`; local checks passed).
- [x] Verify hosted Actions: quality run 39297017294 and health run 39297017241 passed (19 Oct, commit 188cb3a).
- [ ] Configure required branch checks plus secret/dependency scanning; deployment is not yet blocked on Actions.
- [ ] Keep release/rollback instructions up to date; database permissions and UI must remain compatible.

## P1 — design, accessibility and performance

- [x] Ivory/coral design with dark accents and original green/red/blue identity implemented.
- [ ] Complete mobile review at narrow phone, tablet and desktop widths across all pages and admin.
- [ ] Keyboard navigation, visible focus, labels, contrast, reduced motion and form-error review.
- [ ] Verify catalogue/contact links, images, brochure, phone and WhatsApp actions.
- [ ] Check loading, empty, failure and no-results states for every backend screen.
- [x] Prevent brief signed-out admin-shell display before redirect (29 Oct, 87e53d3). Route guard avoids mounting/downloading admin screens without a token; local browser checks and live anonymous redirects passed. Server authorization and rejected-session handling remain intact; token presence alone does not authorize access.
- [ ] Measure performance and optimize image sizes, loading and JavaScript based on results. 27 Oct: secondary routes split into on-demand chunks; initial JS reduced from 555.53 kB to 449.00 kB (gzip 168.05 to 143.27 kB). Image review and measured real-user loading metrics remain pending.
- [x] Load secondary public/admin pages on demand, with loading/error recovery and delayed enquiry-anchor support (27 Oct; local browser regression checks passed; release evidence below).
- [x] Keep client list compact and searchable; automated traversal covers every stored record. 23 Oct live browser: 9 cards/page; final page shows records 82–86 of 86; searching ACME from page 10 resets to the single matching record. This verifies the directory, not the separate 151+ marketing claim.
- [x] Implement public product pagination to match Clients: 9 cards/page, A–Z default, Previous/Next and page selector. Search/category/sort changes reset to page 1 while searching the full catalogue (30 Oct; released in PR #3, merge 74f8789; hosted tests and live browser verification passed).

## P1 — authentic business content

- [ ] Verify company name, complete address, hours, phone, email and service coverage. **Owner confirmation needed.**
- [ ] Verify years of experience, client/installer counts, completion claims and safety statistics against evidence.
- [ ] Replace unsupported claims with factual wording; no fabricated reviews or certifications.
- [ ] Add real project case studies: problem, installation/supply, outcome, dated photos. **Needs owner materials and customer permission.**
- [ ] Review every product's manufacturer/model/specifications, datasheet, image rights and certification evidence.
- [ ] Explain quote → site assessment → supply/installation → maintenance process using actual business practice.
- [ ] Add approved testimonials and client logos only with permission.
- [ ] Publish clear privacy/contact-data handling information based on actual processing and retention decisions.

## P2 — discovery and conversion

- [ ] Connect approved business domain. **Needs domain choice/ownership; purchase requires budget approval.**
- [ ] Review titles, descriptions, canonical URLs, sitemap and robots against final domain.
- [ ] Configure search indexing/Search Console and verify structured company/service data.
- [ ] Add useful service/location pages only for areas genuinely served.
- [ ] Track enquiry success, call and WhatsApp clicks with appropriate privacy choices; no sensitive data in analytics.
- [ ] Publish practical product/maintenance guides reviewed for accuracy; avoid unsupported safety guarantees.
- [ ] Review conversion data and improve weak journeys after real traffic exists.

## Verification log

| Date | Work | Evidence / remaining limit |
| --- | --- | --- |
| 15 Oct 2026 | Backend + admin setup | Live health 200, 40 products; SQL access-control tests passed. Owner browser sign-in not independently exercised. |
| 15 Oct 2026 | Header cleanup | Production READY at 43de28e; visible header checked. |
| 19 Oct 2026 | Inventory automation | 19 API + 18 frontend tests passed; production build passed. V2 SQL migration and rollback-only access/quantity tests passed. Deployed at 93b215c; health 200, catalogue 40, anonymous movement API 401. Secure owner sign-in attempt returned invalid email/password; live authenticated browser workflow remains pending. |
| 19 Oct 2026 | Owner session verified | After user login, dashboard showed the labelled system enquiry as Contacted, with totals 1 enquiry / 0 pending / 1 contacted. Products page rendered 40 products with 40 unrecorded opening quantities; authenticated movement history loaded an empty state. No real stock altered. This resolves the earlier sign-in blocker. |

| 19 Oct 2026 | Category coverage and monitoring | 22 frontend/monitor tests and 19 API tests passed; production build passed. Live read-only checker: 13/13 passed. Added regression fixtures for degraded database, exposed admin reads, broken JS and network failure. README corrected for Supabase V2. Vercel production READY at 188cb3a; hosted quality and health workflows passed. New authenticated UI check is pending because the browser session expired. |

| 19 Oct 2026 | Security review | npm production dependency audit reported 0 known vulnerabilities. Applied internal RLS trigger permission restriction and verified grants; follow-up advisors no longer flag that function. Remaining advisories: intentional authenticated stock RPC with staff check, and plan-gated leaked-password protection. |

| 20 Oct 2026 | Compact inventory UI | 24 frontend tests passed; server-render check confirmed 8 displayed rows / 40 results / 5 pages with no duplicate stock list. Production credential metadata verified without decrypting values; see docs/CREDENTIALS.md. Vercel production READY at 4aec98b; hosted quality workflow 39356766498 passed (24 frontend + 19 API tests and build). Authenticated browser visual verification remains pending; no active staff session available. |

| 23 Oct 2026 | Production and security review | At 05:16:11 UTC (10:46 IST), read-only checker passed 13/13: /, /about, /products, /services, /contact, /clients, /admin/login, both hashed JS/CSS assets, /api/health, /api/products, and anonymous denial on /api/contact and /api/inventory/movements. Header checks passed; Supabase reports connected. Latest three Vercel deployments READY, main 16edae6. Recent 30-minute error/fatal log query returned no groups (not proof of an error-free day). Latest scheduled health run 39885399358 passed; observed runs have multi-hour gaps despite an hourly schedule. All four public tables have RLS; staff membership policies remain in place. npm production audit: 0 known vulnerabilities. Supabase advisories remain the intentional staff-checked stock RPC and disabled leaked-password protection; see links below. |
| 23 Oct 2026 | Stock retry recovery | Recovered the previously uncommitted implementation and completed validation. 30 frontend tests and 19 API tests passed; production build passed. Tests simulate lost response after commit, reload/re-login, malformed responses, definitive rejection, blocked storage, account separation and failed cleanup. No production stock mutation performed. Released in commit [5759ee6](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/5759ee6a0467a58cd04b9ab8f5aa00b15f864b55); Vercel production deployment dpl_6VC2A19vwDQotfumj7pd3XgZwiKf READY. Hosted quality run [39905105135](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/39905105135) succeeded. Post-release production check at 05:20:44 UTC (10:50 IST): 13/13 passed, including new asset index-VgaXVrEZ.js. Live authenticated workflow is unavailable because there is no active staff browser session. |
| 23 Oct 2026 | Client directory interaction | Live browser verified page 10 (82–86 of 86), disabled Next on final page, and search from page 10 returning ACME as 1 of 1. Existing traversal tests verify all stored records are reachable. Mobile widths and visual accessibility audit remain pending. |

### Remaining monitoring and security limits (23 October)

- GitHub's scheduled health checks are arriving several hours apart. Add an independent heartbeat/uptime monitor and verify notification delivery; do not describe the current checks as continuous monitoring.
- [Stock RPC advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable): execution is intentional for signed-in staff and the function checks staff membership; privileged code needs continued review.
- [Leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection): still disabled; the approved project plan has not changed.
- Current browser session has no authenticated staff login; live receipt/dispatch/count/export testing remains unverified. Opening stock and thresholds still require real business figures.

## 24 October 2026 verification

- Pre-release production smoke check at 05:25:37 UTC (10:55 IST): 13/13 passed. Routes: /, /about, /products, /services, /contact, /clients, /admin/login; hashed JS/CSS assets; /api/health and /api/products; anonymous reads denied for /api/contact and /api/inventory/movements. Header assertions passed. Supabase health connected.
- Latest two Vercel deployments READY (main bc390fa); recent 30-minute error/fatal log query returned no groups. This does not cover the full day or prove no errors occurred.
- All four public database tables still have RLS enabled. Security advisors unchanged: staff-checked stock RPC and disabled leaked-password protection (remediation links above). No database, policy or credential change in this release. Full authenticated policy retesting not performed today.
- npm production audit: zero known vulnerabilities. Local verification: 33 frontend tests, 19 API tests and production build passed. New tests cover timeout during response-body reading, connection loss without duplicate submission, and navigation cancellation. Real business records were not mutated.
- SEO source review corrected the product description's inaccurate “40 categories” wording. Complete canonical/indexing review remains pending. Build main JavaScript remains approximately 554 kB; route splitting is still queued.
- Release: commit [92c0add](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/92c0add83adb191c422a7cbe738b5e448a3daacc), Vercel production dpl_D3pJ9Qp4Ad4zjFy8eGVMstGkPSe5 READY. Hosted quality run [40066331198](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/40066331198) passed. Post-release check at 05:28:56 UTC (10:58 IST): 13/13 passed including new asset index-VakLcSLK.js. Latest preceding scheduled health run 40051185701 also passed. Authenticated browser mutation checks, real opening counts, cross-device stock recovery and independent alerts remain outstanding.

## 25 October 2026 verification

- Production read-only checks at 05:19:36 UTC (10:49 IST): 13/13 passed across /, /about, /products, /services, /contact, /clients, /admin/login, JS/CSS assets, /api/health, /api/products and anonymous-denied /api/contact and /api/inventory/movements. Required security-header assertions passed. Latest two deployments READY (main 7b7171b). Recent 30-minute error/fatal log query returned no groups; longer periods were not verified.
- Supabase reports the same two documented advisories (staff-checked stock RPC and disabled leaked-password protection; remediation links above). All four public tables retain RLS. No access policies or business records changed. npm production audit reported zero known vulnerabilities.
- Admin report review found category summaries treating entirely unrecorded stock as zero and combining different units. The exported summary now groups by category and unit, shows counted/awaiting-count product counts, labels incomplete coverage, and retains actual zero quantities. Map-based grouping also handles category names such as constructor safely. Original stock overview and low-stock sheets remain intact.
- Validation: 36 frontend tests, 19 API tests, production build and whitespace check passed. New synthetic tests cover unknown/zero/partial stock, mixed units, unusual category names, invalid quantities, empty inventory and non-mutation. No live authenticated Excel download was performed; an active staff browser session remains unavailable. Main-bundle size remains approximately 554 kB, with performance work still open.
- Release: [4290696](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/42906968fad9b003bf96be6feb0ba9f93a386796), Vercel production dpl_A7gmqBzyYUSc8X3PzVUwKtAeBcvp READY. Hosted quality run [40165231374](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/40165231374) passed. Post-release smoke check at 05:23:01 UTC (10:53 IST): 13/13 passed including new asset index-pvLPzi75.js. Latest preceding scheduled health run 40150275427 passed. Independent uptime alerts, real stock counts and authenticated workflow verification remain open.

## 26 October 2026 verification

- Pre-release production check at 04:43:30 UTC (10:13 IST): 13/13 passed. Tested /, /about, /products, /services, /contact, /clients, /admin/login, hashed JS/CSS assets, /api/health, /api/products, and anonymous denial of /api/contact and /api/inventory/movements. Security-header assertions passed; Supabase health connected. Latest two deployments READY at ca2cab5 and 4290696. Recent 30-minute Vercel error/fatal query returned no groups; longer retention not checked.
- npm production audit: zero known vulnerabilities. All four public tables retain RLS; Supabase advisories remain the documented staff-checked stock RPC and disabled leaked-password protection (links above). Full authenticated access-policy retesting was not performed; no policies, credentials or database records changed.
- Corrected stock-manager usability and accuracy: mixed-unit total replaced with Products Counted (recorded / total). Collapsed Recorded stock by unit section separates units across categories, distinguishes unrecorded totals from real zero, shows awaiting-count coverage, wraps long unit names and limits expanded height to avoid another long page.
- Local verification: 38 frontend tests, 19 API tests, build and whitespace checks passed. React server-render assertions verified separate units, zero and unknown labels, collapsed default and empty inventory. This is not a live authenticated browser or mobile visual test; those remain pending. Main JS is 555.53 kB uncompressed; route splitting remains queued.
- Release: [a32eb44](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/a32eb44948a9468791b7c0802038a0047bb00c76), Vercel production dpl_HntPo3SZXvQVcu9EuH68eqzne1By READY. Hosted quality run [40270667091](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/40270667091) passed. Post-release smoke check at 04:46:42 UTC (10:16 IST): 13/13 passed including index-DtAfLe5g.js. Latest preceding scheduled health run 40254092848 passed. Actual opening quantities, authenticated stock mutations/download, independent alerts and cross-device recovery remain outstanding.

## 27 October 2026 verification

- Initial read-only production checks at 05:28:47 UTC (10:58 IST): 13/13 passed. Routes: /, /about, /products, /services, /contact, /clients, /admin/login, hashed JS/CSS assets, /api/health, /api/products, anonymous-denied /api/contact and /api/inventory/movements. Required security headers passed; database connected. Latest two deployments READY at 9e1a53b and a32eb44. Recent 30-minute error/fatal log query returned no groups, not a full-day guarantee.
- npm production audit: zero known vulnerabilities. All four public tables retain RLS. Supabase advisories unchanged: intentional staff-checked stock RPC and disabled leaked-password protection (remediation links above). No schema, policies, credentials or real business records changed. Full authenticated access-policy retesting remains pending.
- Performance change: Home remains eager; nine secondary public/admin screens load on demand. Route-level loading feedback and an error boundary preserve navigation after a failed page download, with explicit reload rather than automatic reload. Hash scrolling starts only after the page is ready and respects reduced-motion preference. Existing content, catalogue and branding preserved.
- Local validation: 38 frontend tests, 19 API tests, production build and whitespace checks passed. Fifteen local Chromium browser checks passed using synthetic API fixtures: deferred downloads, navigation/direct entries including 404, anonymous admin redirects, slow enquiry hash navigation, failed-download home recovery and 390px Contact overflow. These are not authenticated stock tests. Latest preceding scheduled Production health run 40427637505 passed; schedule gaps remain. Release: [a807cf2](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/a807cf2271b6916c2f133d9bcf4787e1001877e9), Vercel production dpl_3KLWGvkf1tph4DtxsJ5YHjT8XJFB READY. Hosted quality run [40456212295](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/40456212295) passed (frontend/API tests and build; the optional browser suite ran locally). Post-release smoke at 05:37:35 UTC (11:07 IST): 13/13 passed with new entry index-Duun8ENf.js and CSS index-DYvJZRkK.css. Live cloud-browser verification completed by 05:40 UTC (11:10 IST): Home, About, Products, Services, Contact, Clients, Hyderabad client directory and Login rendered; /admin/products and /admin/dashboard settled on the sign-in form. Contact #inquiry scrolled to the form below the header. No authenticated workflow or business mutation was performed. See docs/ROUTE_LOADING.md for reproduction and limitations. New follow-up: extend production monitoring to verify dynamically imported route chunks, not only the entry JS/CSS. Dedicated independent uptime alerts, authenticated stock workflow verification, actual stock counts and cross-device recovery remain pending.

## 28 October 2026 verification

- Read-only production checks at 05:18:58 UTC (10:48 IST): 13/13 passed across /, /about, /products, /services, /contact, /clients, /admin/login, entry JS/CSS, /api/health, /api/products, and anonymous-denied /api/contact and /api/inventory/movements. Required header assertions passed; database connected. Latest two deployments READY at 31ce112 and a807cf2. Recent 30-minute error/fatal log query returned no groups; longer periods were not verified.
- npm production audit: zero known vulnerabilities. All four public tables retain RLS. Security advisories unchanged: intentional staff-checked stock RPC and disabled leaked-password protection (links above). No policies, credentials or business records changed; full authenticated policy retesting remains pending.
- Prepared the signed-out admin-flash fix in [draft PR #1](https://github.com/Jashwanth0612/wipro-fire-safety-v2/pull/1), commit [6b57612](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/6b57612125d27a37d7e601c7fa0b2fe57d554506). A route-level presence check prevents mounting/downloading staff screens when there is no token. It is a UX gate, not authorization; server checks and 401/403 handling remain unchanged.
- Local validation passed: 38 frontend tests, 19 API tests, production build and whitespace checks. Added browser cases for anonymous chunk exclusion, synthetic local sessions and server rejection. These browser cases have NOT run: temporary Playwright tooling was missing, then the execution environment became unavailable before reinstall. This is an execution blocker, not a production outage. No application change deployed to production; only this evidence document is updated on main.
- Next run: resume PR #1, run the optional local browser suite (including its new cases), inspect hosted CI, then merge/deploy only after verification. Follow with live anonymous route checks. Authenticated business workflows, real stock figures and independent uptime/error alerts remain outstanding. Quotation/follow-up workspace remains a proposed next business feature, not implemented.

## 29 October 2026 verification

- Resumed PR #1 after reading AGENTS.md, current main checklist and source. Pre-release production smoke at 04:41:40 UTC (10:11 IST): 13/13 passed across /, /about, /products, /services, /contact, /clients, /admin/login, entry JS/CSS, /api/health, /api/products, and anonymous-denied /api/contact and /api/inventory/movements. Required security-header assertions passed; database connected.
- Latest two pre-release Vercel deployments were READY (main cf477be and preview 6b57612). Recent 30-minute production error/fatal query returned no groups; this is not full-day error coverage. npm production audit: zero known vulnerabilities. All four public database tables retain RLS. Supabase advisors unchanged: intentional staff-checked stock RPC and disabled plan-gated leaked-password protection (links above). No database, policy, credential or real business data changes.
- Restored missing temporary Python/Playwright tooling and completed previously blocked validation: 38 frontend tests, 19 API tests, production build and all 19 local Chromium checks passed. Browser tests use synthetic API fixtures; they cover anonymous admin chunk exclusion, synthetic local sessions, rejected-session redirects, deferred route downloads, delayed hash navigation, download-failure recovery and narrow Contact layout. They are not real authenticated stock transactions. Hosted PR quality run 40637497502 passed.
- Merged [PR #1](https://github.com/Jashwanth0612/wipro-fire-safety-v2/pull/1) at [87e53d3](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/87e53d309d6cd8ab3be5035a5c287b33d99a405f). Production deployment dpl_FQMrk7absp1HeJByLGW4QYDrYC81 is READY. Hosted main quality run [40819313117](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/40819313117) passed frontend tests, API tests and build.
- Post-release production smoke at 04:45:27 UTC (10:15 IST): 13/13 passed, including new entry index-D1ccl0pr.js and CSS index-DYvJZRkK.css. Live cloud-browser checks completed by 04:46 UTC: both /admin/products and /admin/dashboard redirected to /admin/login and rendered the sign-in form; public /products rendered all 40 catalogue products and five category filters. Browser DOM confirmed the new entry asset. No login attempt, customer submission or stock mutation was made.
- Remaining limits: no active staff session for real receipt/dispatch/count/Excel verification; real opening quantities and reorder thresholds need business figures. Independent uptime/error/recovery alerts, closed-tab stock recovery, full mobile/accessibility checks, backup restore verification and content certification evidence remain pending. Next actionable reliability work: include deferred route assets in production monitoring and run the browser regression suite in hosted CI. Preserve real catalogue data while reviewing unsupported marketing claims.

## 30 October 2026 verification

- Read AGENTS.md, current main checklist and monitoring source. Previous local worktree metadata was unavailable; recovered a fresh clone of main 2eb9bd3 without modifying earlier workspaces.
- Pre-release production check at 04:43:02 UTC (10:13 IST): 13/13 passed across /, /about, /products, /services, /contact, /clients, /admin/login, entry JS/CSS, /api/health, /api/products and anonymous-denied /api/contact and /api/inventory/movements. Required headers passed; database connected. Latest two deployments READY. Recent 30-minute error/fatal log query returned no groups; longer periods unverified.
- npm production audit: zero known vulnerabilities. All four public tables retain RLS. Supabase advisors unchanged: staff-checked SECURITY DEFINER stock RPC and disabled leaked-password protection (remediation links above). No schema, policies, credentials or business records changed. Authenticated policy and stock workflow retesting remain pending.
- Extended the production monitor to follow literal Vite JS/CSS asset references recursively. It rejects missing/empty/HTML responses, deduplicates shared/cyclic references, excludes external/traversal/query URLs and fails explicitly above 64 assets. It never executes downloaded code. This closes missing-page-file coverage after route splitting; it does not prove page rendering or establish continuous alerting.
- Validation: 42 frontend tests (including four new monitor regressions), 19 API tests, production build and whitespace check passed. Comparison against local build output covered all 18 JS/CSS files with none missing. Expanded live check at 04:43:34 UTC (10:13 IST): 29/29 passed. New fixtures exercise broken lazy chunks, shared dependencies/preload CSS, URL restrictions and excessive graphs. No authenticated browser or stock mutation test was performed.
- Release: [5704d4b](https://github.com/Jashwanth0612/wipro-fire-safety-v2/commit/5704d4b7482a1e1f8bb3aa26bd628eb570456ae2). Vercel production dpl_FKVTLgk2h6a6W5AENjw2chzP6YU6 READY, with the production alias confirmed. Hosted [quality run 41004600126](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/41004600126) and [Production health run 41004600173](https://github.com/Jashwanth0612/wipro-fire-safety-v2/actions/runs/41004600173) both succeeded. Post-release live check at 04:46:43 UTC (10:16 IST): 29/29 passed. Application asset hashes are unchanged because this release changes monitoring/tests/docs only.
- Next: pin and run browser regression tooling in hosted CI; establish independent uptime/error and recovery notifications with verified delivery. Real opening quantities, reorder thresholds, authenticated receipt/dispatch/count/export, backup restore drill and certification evidence remain outstanding. Recheck asset-discovery coverage whenever bundler output syntax changes.

## Operating guide

1. Count existing stock once and record **Physical count / correction**, with a reference.
2. When goods arrive, select the product, choose **Receive stock**, enter quantity and delivery/invoice reference, then record.
3. When goods leave, choose **Dispatch stock**, enter quantity and delivery reference. Do not deduct for an enquiry alone.
4. Totals and low-stock status follow the saved balance. Review history for who recorded each change and when.
5. Use **Physical count / correction** for a reconciliation, with a clear reason. Never delete history to hide a mistake.
6. A request with an uncertain network result should be retried in the same browser tab with **Retry same entry safely**. Refreshing or signing back in with the same account restores that request. Do not repeat it in a different tab or device. Closing the tab can remove recovery details; check history before creating another entry.

Automation cannot detect physical deliveries on its own. Staff still identify the product, quantity and reference; a future barcode/invoice integration requires real identifiers and review before changing stock.

### Content audit findings (19 October)

`src/pages/About.jsx` still contains 1000+ clients, 100% compliance, 24/7 support and an ISO-certified timeline entry. These are unverified, not accepted as true by this checklist. Owner evidence is required before launch; replace unsupported wording rather than fabricating supporting material.

## 30 October 2026 — requested security hardening

Prepared cookie sessions with shared revocation, CSRF checks, shared abuse budgets, public inventory column restrictions, local spreadsheet bundling and whole-tree dependency cleanup. See docs/SECURITY_REVIEW_2026-10-30.md for the complete control matrix, validation and exact remaining dependencies. Local checks: 27 API/security tests, 43 frontend tests, 20 Chromium checks, integrated browser/API session flow, production build, Gitleaks zero matches and npm/Python audits zero known vulnerabilities. Database access/stock/security regression checks passed in a rollback transaction with synthetic fixtures. Release/migration evidence will be appended after hosted verification. Recovery/MFA require operator login; dedicated alerts require approved destination/provider; backup restore remains unverified. No real stock/customer records changed.

### Security release verified

Released via PR #2, merge 21d3a3c1e137bf7adccf8dafd9c5a7ad42d38aec; Vercel production dpl_31BA2UGagTAHRYbJRzeY8VFAfMk6 READY. Final application CI quality 41039498960 and secret scan 41039499051 passed. Shared-session/rate migration 20261030100946 and post-release public-column restriction 20261030102023 applied. Live smoke 32/32; signed-out live admin route rendered login. Database rollback regression checks passed after activation. Live Auth settings confirm public signup/anonymous users disabled. Controlled rate concurrency: 5 accepted, 7 denied from 12 simultaneous requests. Structured denial logs reached production logging. Database remains 40 products, 39 active/1 archived, one staff member; no real inventory/customer changes. See the full security report for account-controlled recovery/MFA, leaked-password plan restriction, dedicated alerts, branch checks and backup-restore limits.

Supplemental live security checks passed 18/18, including validation, body limits, CORS, inventory privacy and exposed-file responses. The live harness was corrected for case-insensitive headers and the actual active-record count before recording this result.

## 30 October 2026 — public product pagination correction

- Owner reported that the public Products page showed the complete range at once. Confirmed the live page rendered 40 cards without pagination. Git history shows the public Products page had no pagination implementation; the earlier compact-product work covered the private admin inventory only. The security release did not change the public Products component.
- Added the Clients-style Previous/Next buttons and page selector, nine products per page, A–Z default, range/total count, and focus/scroll back to Browse products. Featured ordering remains selectable. Search, category and sort changes reset to page 1; filtering still covers the complete merged catalogue. Product details, quote selections and original catalogue information are preserved. The WhatsApp shortcut is placed below the catalogue to avoid covering page controls.
- Local validation: 45 frontend tests, 27 API tests and production build passed. Browser regression suite includes full 40-item traversal with no omissions/duplicates, first/last page limits, direct page selection, full-catalogue model search, category/sort reset, empty/reset state, details/shortlist persistence, and offline mobile pagination. Initial mobile assertion found doubled scroll spacing from shared styles; corrected the product heading offset before final verification.
- Released via [PR #3](https://github.com/Jashwanth0612/wipro-fire-safety-v2/pull/3), application commit 54f916b306b6b60a54f0e239466b094193388af7, merge 74f878986676358d3d9a25ddf7286387aafa4dd0. Hosted quality run 41062243712 and secret scan 41062243693 passed, including all 23 Chromium checks. Vercel production dpl_9LVshe1A4MXjY5xaCba3dmG2yUTi READY with the canonical alias assigned.
- Live browser verified nine cards on page 1, Next showing 10–18, page 5 showing 37–40 with Next disabled, full-catalogue VFPA4 search from page 5, and clearing search returning to page 1. Captured the live page controls in outputs/Wipro-products-pagination-live.png in the task workspace. Public display retains the original 40-item brochure range through the existing catalogue merge behavior; database active-record counts are a separate concern.
- Production smoke at 21:55 IST: 32/33 checks passed initially; the single icon-chunk fetch failed. A targeted retry returned HTTP 200 and its SHA-256 exactly matched the local production build, resolving that check without an application change. Live public pages/API/access denials and remaining assets passed. The release error/fatal log query returned no groups for its recent 10-minute window; this is not continuous monitoring.
- No database, credentials or real business records changed. Previously documented owner workflow/security follow-ups remain unchanged.

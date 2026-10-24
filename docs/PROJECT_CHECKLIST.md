# Wipro Fire & Safety V2 — delivery checklist

Last reviewed: 24 October 2026. Owner: Jashwanth. Scope: V2 only; preserve V1.

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
- [ ] Review browser token storage and migrate to secure HttpOnly sessions with CSRF protection.
- [ ] Shared rate limiting / bot protection for login and enquiry endpoints; existing per-process limiter is not a global limit.
- [ ] Verify backup schedule/retention and perform restore drill in an isolated database. **Needs access/plan details; no paid upgrades assumed.**
- [x] Implement credential-free production smoke checks and an hourly GitHub Actions workflow with safe pass/fail summaries (19 Oct). Local live run: 13/13 passed. GitHub Production health run 39297017241 succeeded.
- [ ] Complete error monitoring, notification delivery and recovery alerts; a scheduled smoke checker alone does not satisfy this item.
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
- [ ] Measure performance and optimize image sizes, loading and JavaScript based on results. 23 Oct build: main JS approximately 554 kB uncompressed; investigate route splitting and measure public-page load performance.
- [x] Keep client list compact and searchable; automated traversal covers every stored record. 23 Oct live browser: 9 cards/page; final page shows records 82–86 of 86; searching ACME from page 10 resets to the single matching record. This verifies the directory, not the separate 151+ marketing claim.

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

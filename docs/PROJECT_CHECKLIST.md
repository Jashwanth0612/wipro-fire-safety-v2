# Wipro Fire & Safety V2 — delivery checklist

Last reviewed: 19 October 2026. Owner: Jashwanth. Scope: V2 only; preserve V1.

## How to use this document

At the start of every project session, read this checklist and the latest code/deployment. Verify evidence before checking an item off. Complete the highest-priority actionable task, test it, then record the date, commit and result. A deployed screen alone does not prove a workflow works. Leave items blocked by missing information unchecked and name the exact dependency. Never invent stock, customers, certificates, reviews or specifications. Weekly automated review is scheduled for Mondays around 10am India time, subject to connected-app access.

Status: `[x]` verified completed; `[ ]` pending. Implementation awaiting live verification stays pending. The previous 80% estimate was a judgement, not a measured acceptance score.

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
- [ ] Fix category-filter coverage: existing Safety Equipment products are not represented by the hardcoded PPE Equipment category button.
- [ ] Record actual opening quantities for every stocked product. **Needs business input:** physical count by owner/father; no assumed zeros.
- [ ] Configure meaningful minimum-stock thresholds for each product. **Needs business input:** reorder quantities and lead times.
- [ ] Create father's separate staff account. **Needs input:** his email, user-controlled password setup and explicit account grant.
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
- [ ] Review browser token storage and migrate to secure HttpOnly sessions with CSRF protection.
- [ ] Shared rate limiting / bot protection for login and enquiry endpoints; existing per-process limiter is not a global limit.
- [ ] Verify backup schedule/retention and perform restore drill in an isolated database. **Needs access/plan details; no paid upgrades assumed.**
- [ ] Add health/error monitoring with useful, non-sensitive logs and alerts.
- [ ] Test session expiry, offline responses, retries, timeout feedback and safe recovery.
- [x] Add GitHub Actions build, API and frontend/inventory tests (19 Oct, `.github/workflows/quality.yml`; local checks passed).
- [ ] Verify Actions run and configure required branch checks plus secret/dependency scanning; deployment is not yet blocked on Actions.
- [ ] Keep release/rollback instructions up to date; database permissions and UI must remain compatible.

## P1 — design, accessibility and performance

- [x] Ivory/coral design with dark accents and original green/red/blue identity implemented.
- [ ] Complete mobile review at narrow phone, tablet and desktop widths across all pages and admin.
- [ ] Keyboard navigation, visible focus, labels, contrast, reduced motion and form-error review.
- [ ] Verify catalogue/contact links, images, brochure, phone and WhatsApp actions.
- [ ] Check loading, empty, failure and no-results states for every backend screen.
- [ ] Measure performance and optimize image sizes, loading and JavaScript based on results.
- [ ] Keep client list compact and searchable; verify all records remain reachable.

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

## Operating guide

1. Count existing stock once and record **Physical count / correction**, with a reference.
2. When goods arrive, select the product, choose **Receive stock**, enter quantity and delivery/invoice reference, then record.
3. When goods leave, choose **Dispatch stock**, enter quantity and delivery reference. Do not deduct for an enquiry alone.
4. Totals and low-stock status follow the saved balance. Review history for who recorded each change and when.
5. Use **Physical count / correction** for a reconciliation, with a clear reason. Never delete history to hide a mistake.
6. A request with an uncertain network result should be retried with the same entry, not entered again as a new delivery.

Automation cannot detect physical deliveries on its own. Staff still identify the product, quantity and reference; a future barcode/invoice integration requires real identifiers and review before changing stock.

### Content audit findings (19 October)

`src/pages/About.jsx` still contains 1000+ clients, 100% compliance, 24/7 support and an ISO-certified timeline entry. These are unverified, not accepted as true by this checklist. Owner evidence is required before launch; replace unsupported wording rather than fabricating supporting material.

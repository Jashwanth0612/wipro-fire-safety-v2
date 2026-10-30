# Wipro Fire & Safety V2 — security review

Date: 30 October 2026. Scope: `Jashwanth0612/wipro-fire-safety-v2`, its Vercel V2 deployment and Supabase V2 project. V1 is excluded. This is a source/configuration review with targeted attack-path tests, not a certification or a guarantee against compromise.

## Status

The website has a live public catalogue and staff enquiry/inventory workspace. The database contains 40 products and one approved staff member. Quotation PDFs and the follow-up workspace remain proposed work. Opening counts, reorder thresholds and real signed-in receipt/dispatch/export verification remain outstanding.

The security change replaces local-storage bearer sessions with server-verified, revocable HttpOnly cookie sessions, adds CSRF checks and distributed rate limits, and separates public catalogue fields from staff inventory. Release evidence is recorded below after verification.

## Findings and changes

| Priority | Finding | Fix / evidence |
| --- | --- | --- |
| High | Admin bearer tokens persisted in local storage and logout only removed the local copy. | Secure, HttpOnly, SameSite=Strict, host-only cookie; signed one-hour maximum session bounded by upstream expiry; shared hashed session identifiers; server-side logout revocation; old browser tokens removed and bearer-only staff requests rejected. Session discovery verifies staff before loading admin screens. |
| High | Public catalogue queries returned stock balances and reorder thresholds. | Public API explicitly selects catalogue columns; separate authenticated `/api/admin/products` endpoint. Database anonymous SELECT privileges restricted to the same public columns; ordinary signed-in users cannot read inventory rows. |
| High | Abuse protection used per-process memory and did not span serverless instances. | Atomic Postgres fixed-window counters for login (10/10 min), enquiries (5/10 min), and chat (20/min), keyed by HMAC of the trusted client address. Only server credentials can call these RPCs. Unavailable protection fails closed. Expired counter rows are cleaned up. |
| High | Installed npm dependency tree had 74 advisories, including 11 critical, largely through obsolete development tooling. | Removed unused `npx`, `init`, `axios`, `emailjs-com`; compatible dependency updates and committed lockfile. Full npm audit now reports zero known advisories. Earlier runtime-only audits did not cover this whole development tree. |
| Medium | Spreadsheet export loaded SheetJS 0.18.5 from a CDN. | Replaced it with official, pinned 0.20.3 distribution, verified by lockfile integrity and loaded lazily from the site's own bundle; removed external script CSP permission. Export download tested with synthetic data. The older library's published parsing CVEs were not demonstrated exploitable through this export-only feature. |
| Medium | Production API schema/debug routes were accessible by default. | FastAPI debug explicitly disabled and `/docs`, `/redoc`, `/openapi.json` disabled. Tests assert denial. Generic error/validation responses retain no-store and security headers. |
| Medium | No automated secret/dependency/browser gate in the existing quality workflow. | Added full dependency audits, checksum-verified Gitleaks history scan and pinned Playwright browser checks to CI. Existing frontend/API/build checks retained. Required branch checks remain an operator setting; workflow presence alone does not enforce merges. |
| Medium | Retained local Mongo login compared a plaintext environment password. | Local compatibility now requires PBKDF2-SHA256 with at least 600,000 iterations. Hosted fallback authentication is denied; Vercel staff access requires Supabase. Live Supabase password hashes were confirmed to be bcrypt using an aggregate query, without retrieving hashes. |

## Requested controls

| Control | Result / boundary |
| --- | --- |
| Authentication/admin access | Every staff API requires a valid signed cookie, active shared session, valid Supabase user and current staff membership. RLS independently restricts staff reads/writes. No new staff account was granted. |
| API keys/environment | Supabase keys are server variables; production metadata identifies both keys and `JWT_SECRET` as sensitive. No `VITE_` secret variables found. Values were not decrypted or printed. Legacy Mongo variables remain for the retained implementation; their current use by V1/rollback is not established, so they were not deleted. |
| Password hashing | Live Supabase aggregate confirms bcrypt; no password/hash values exported. Local compatibility uses PBKDF2. No custom production password store introduced. |
| HTTPS/cookies | HTTP redirects to HTTPS with 308; HSTS, Secure/HttpOnly/Strict cookie flags, no Domain attribute and no-store responses. One-hour maximum; no refresh tokens exposed to browser code. |
| CSRF/CORS | Cookie mutations require an allowed Origin and HMAC-bound CSRF header. Login also checks Origin and JSON content type. Cross-origin, missing and previous-session CSRF tokens are tested and rejected. No wildcard CORS or credentialed cross-origin access. |
| Server-side validation | Pydantic length/type/quantity/UUID/phone/email checks; 64 KiB streamed body limit; invalid data cannot bypass enquiry validation. No client price/payment value is authoritative. |
| XSS/headers | React escapes stored text; injected HTML displayed as text in browser regression. CSP restricts scripts/connect to self, blocks objects/framing, and upgrades insecure requests. MIME, framing, referrer, permissions and HSTS headers verified. Inline CSS remains permitted for the current React design. |
| Database/queries | All four business tables have RLS; private security tables also have RLS and no public grants. PostgREST uses structured parameters; stock uses the atomic RPC with staff checks, locks and idempotent request IDs. No raw user-built SQL found. |
| Logging/monitoring | Fixed security event logs for denied origins/CSRF, login, logout and 401/403/429; request IDs, no passwords/tokens/customer contents/raw IPs in these events. Existing scheduled health checker extended for new staff endpoints and inventory privacy. Dedicated continuous alerts and delivery/recovery tests are not configured. |
| Password reset/MFA | Recovery is not implemented in the app. Supabase dashboard requires operator sign-in; actual reset-token expiry, sender, redirect and delivery could not be verified. Staff MFA enrollment and recovery credentials need the account holder. No recovery email was sent. |
| Leaked-password check | Supabase advisor still reports disabled protection. Prior checklist records the Free plan and no approved upgrade. No paid service was enabled. |
| Uploads | No upload endpoint or Supabase Storage bucket exists. Multipart submission to the JSON enquiry endpoint is rejected; bodies are bounded. Future uploads need MIME/content/size checks and private access before enabling. |
| Prices/payments | No payment/checkout endpoint exists. The site collects enquiries and product quantities; it does not charge money or confirm sale prices. Payment verification is therefore not applicable to the current feature set. |
| Exposed files/secrets | Gitleaks 8.30.1 scanned all 42 reachable commits across fetched refs and the working tree with zero matching leaks. This is pattern-based detection and does not prove a secret never existed in an unreachable/deleted ref, another repository, logs or a third-party system. No confirmed compromised key was found, so no speculative credential revocation was performed. |
| Dependencies | Full root npm audit and Python environment audit report zero known vulnerabilities after cleanup. Python audit initially flagged the local toolchain's old pip; pip was updated. Direct backend packages are pinned and unused multipart/direct requests/certifi requirements removed. Dormant legacy Node/reference projects are not deployed by the V2 Vercel config. |

## Verification

- API/security tests: 27 passed against isolated fake data and mock upstream transport.
- Frontend/calculation/recovery/monitor tests: 43 passed, including catalogue privacy detection.
- Chromium route/XSS/export checks: 20 passed using synthetic API fixtures.
- Additional integrated browser → actual Python API → synthetic Supabase transport check passed: login, HttpOnly cookie, no token in local storage/document.cookie, refresh persistence, denied missing CSRF, accepted staff status update, logout and replay rejection.
- Supabase transaction tests passed for anonymous/nonstaff/staff access, stock idempotency/quantity guards, and new session/rate privileges; all synthetic business fixtures rolled back.
- Live shared-counter concurrency test: 12 simultaneous calls allowed exactly 5 and denied 7; synthetic rate rows were then removed.
- Production build and whitespace checks passed. Gitleaks history and working-tree scans: zero matching findings. npm and Python audits: zero known vulnerabilities.
- Pre-release credential-free production smoke: 29/29 passed. Expanded post-release results and migration IDs are recorded below.

The integrated browser used synthetic identities, not the owner's account. Real owner login, stock operations, recovery delivery, MFA, independent alert delivery and isolated backup restore are not claimed as completed.

## Release and rollback

1. Apply additive `web_security_controls` migration (no catalogue/customer changes).
2. Release the matching frontend/API together after CI passes.
3. Apply `restrict_public_inventory_fields` after the new public API selects only public fields. Applying it first would break the old API's SELECT `*`.
4. Recheck live health, catalogue, protected endpoints, headers, exposed-file responses and advisors.

A frontend rollback to the old local-storage release is not a safe standalone rollback. Revert the anonymous column restriction first if an older API requires SELECT `*`, then deliberately restore the matching old API/UI only as an emergency rollback. The preferred repair preserves the stricter permissions and cookie session design. No stock-history migration is reverted and no real inventory records are modified.

The two new private security tables intentionally have RLS enabled with no public policies (default deny), so the advisor emits two informational notices. The existing stock RPC warning is intentional and covered by staff/nonstaff tests; leaked-password protection remains disabled.

## Remaining actions

1. Account holder signs into Supabase to verify recovery expiry/redirect/sender and enroll MFA; enable leaked-password protection only on an approved supported plan.
2. Choose an approved alert destination/provider, then test failure and recovery notifications. Existing scheduled checks have gaps and do not provide continuous coverage.
3. Verify backup retention and restore in an isolated database, plus required branch checks. Avoid any paid changes without budget authorization.
4. Complete an owner-controlled real staff login and inventory workflow test using genuine stock information. Keep quantities unchanged during a read-only check.

## References

- [Supabase password security](https://supabase.com/docs/guides/auth/password-security)
- [Supabase sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Intentional stock RPC advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Vercel request headers](https://vercel.com/docs/headers/request-headers)
- [Official SheetJS installation](https://docs.sheetjs.com/docs/getting-started/installation/frameworks/)
- [Gitleaks](https://github.com/gitleaks/gitleaks)

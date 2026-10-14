# Security status and operating notes

This is a hardening baseline, not a penetration-test certification or a promise
that the site is unhackable. Preserve the original website and records during V2 rollout.

## Implemented controls

- Supabase staff membership and row-level access policies; no public enquiry reads,
  direct enquiry writes, self-promotion, or permanent product deletion.
- Staff operations use the caller's Supabase token, rather than the server secret.
- Request size bounds (including streamed requests), field validation, sanitized
  validation errors, explicit CORS origins and non-cacheable API responses.
- Deployment CSP, anti-framing, MIME-sniffing protection, HTTPS preference, and
  restricted browser permissions. The existing spreadsheet export script is pinned
  with subresource integrity; integrity is not a vulnerability audit of that library.
- Compatible updates to frontend runtime dependencies after npm audit findings.

## Remaining activation and security work

- Supabase project creation, server-only Vercel keys and approved staff provisioning
  remain required. Live persistence and hosted RLS must be tested before cutover.
- The abuse limiter is per process. Shared edge throttling/bot protection is still
  required for reliable enforcement across serverless instances.
- Admin bearer tokens remain in browser storage. CSP reduces attack surface but
  does not eliminate XSS risk. A future session redesign should use HttpOnly cookies
  together with CSRF protection and explicit session revocation.
- Enable MFA for hosting, GitHub and Supabase operator accounts, and choose a backup
  and restore process. These account settings have not been verified here.
- Dependency audit results are point-in-time and do not cover all source-code bugs,
  the CDN spreadsheet library, provider infrastructure or compromised accounts.
- CSP currently permits only same-origin API requests. A deliberate switch to a
  separate API host requires an explicit connect-src update and verification.

## Checks

Run `node --test tests/*.test.mjs`, `npm run build`, and
`python -m pytest backend/tests -q`. Audit runtime packages using
`npm audit --omit=dev` and `pip-audit` in the backend environment. Run the SQL
checks in `supabase/tests/rls.sql` against a separate test project after migration.
Never place passwords, service keys, real customer exports, or session tokens in Git.

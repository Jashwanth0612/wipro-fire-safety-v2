# Wipro Fire & Safety V2 — Supabase activation

The implementation is staged. `DATA_BACKEND=mongo` preserves the current backend;
`DATA_BACKEND=supabase` selects Supabase exclusively, with no silent database fallback.
The existing 40-product catalogue and visual design remain intact.

## Setup order

1. Create a **separate V2** Supabase project. Choose a region near the business.
   Review the plan and costs before accepting any paid option.
2. Apply `migrations/202610120001_wipro_backend.sql` to the new project, then
   `migrations/202610150001_original_catalogue.sql`. The second migration adds all
   40 original catalogue products to the admin inventory, without inventing stock
   or overwriting existing linked products. Regenerate it after intentional
   catalogue changes with `node scripts/generate-catalogue-seed.mjs`.
3. Disable public sign-ups under Authentication settings. Create the owner's Auth
   user securely through Supabase. Do not put passwords in SQL or GitHub.
   Email invitations are optional and require explicit authorization before sending.
4. Copy the owner's actual Auth UUID, then run as database owner:
   `insert into public.staff_members(user_id) values ('OWNER_AUTH_UUID');`
   Users cannot grant themselves staff access; email and user metadata are not roles.
5. Set **server-only** Vercel environment variables: `SUPABASE_URL`,
   `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`. Use a secret key (or legacy
   service_role key) only in the server environment. No Supabase secret enters Vite.
6. Activate `DATA_BACKEND=supabase` in a V2 preview first, then redeploy.
   Verify `/api/health`, staff login, a clearly labelled test enquiry and quote,
   status update, stock update, sign-out, and non-staff/anonymous denial.
   Run `tests/rls.sql` against the separate test project; the transaction rolls back.
7. Only switch V2 production after these tests pass. Do not remove Mongo configuration
   or claim old records migrated. Export/import existing records separately when the
   original database is accessible, comparing IDs and counts before cutover.

## Access model

- Visitors can read unarchived products (including availability, matching the existing API).
- Enquiry submission passes existing server validation and rate limiting. Only this
  write and readiness checks use the server secret. There is no anonymous table insert.
- Staff login uses Supabase Auth. Every staff request verifies the current user and
  staff membership. Database reads and writes use that user's bearer token and RLS.
- Staff may read enquiries and update their status; cannot rewrite enquiry contents.
- Product removal archives the row; database deletion is not granted to clients.
- Sessions expire according to Supabase Auth settings and require signing in again.
  Refresh tokens are deliberately not returned or stored. Existing browser bearer-token
  storage remains; protect the app against XSS and use a short staff session lifetime.
- The current server abuse guard is per process. Configure a shared/edge rate limit
  before accepting substantial traffic; this is not distributed spam protection.
- No email delivery, chat history, file storage, realtime subscription, or customer
  account feature is enabled by this migration.

## Verification

From the repository root, after installing `backend/requirements-dev.txt`:
`python -m pytest backend/tests -q`

The Python tests use simulated Supabase responses; they do not establish that a
hosted database is configured. SQL tests execute real role/RLS checks when a test
project is available. Do not label deployment connected until live checks succeed.

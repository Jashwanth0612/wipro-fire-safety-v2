# Wipro Fire & Safety — Version 2

Professional B2B catalogue and enquiry website, with a private staff dashboard for products and audited stock movements.

**Production:** https://wipro-fire-safety-v2.vercel.app/

**Stack:** React + Vite · FastAPI on Vercel · Supabase PostgreSQL and Auth

## Project guide

| Need | Document |
| --- | --- |
| Verified progress, remaining tasks and business inputs | [Delivery checklist](docs/PROJECT_CHECKLIST.md) |
| Credential names and storage boundaries | [Credentials guide](docs/CREDENTIALS.md) |
| Production checks and incident response | [Monitoring guide](docs/MONITORING.md) |
| Database migrations, staff permissions and stock ledger | [Supabase setup](supabase/README.md) |
| API setup and verification | [Backend guide](backend/README.md) |
| Contribution and verification rules | [Working agreement](AGENTS.md) |

## What is implemented

- Original catalogue, searchable products, product details and quote shortlists.
- Compact client directory, contact forms and responsive ivory/coral presentation.
- Supabase-backed enquiries and staff-only administration.
- Stock receipts, dispatches and physical counts with atomic balance updates and immutable history.
- Inventory search, category/status filters and Excel export.

Implementation is not a claim that every acceptance test is complete. The checklist distinguishes deployed code, tested behavior and remaining work. Actual opening stock must come from the business; unknown quantities are not assumed to be zero.

## Local development

```sh
npm ci
npm run dev
```

Configure the API separately using `backend/.env.example`. For the V2 Supabase backend, set `DATA_BACKEND=supabase`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` in the server environment. Apply the ordered migrations and staff setup described in the Supabase guide. The secret key must never enter Vite, browser code, commits or logs.

The frontend defaults to `/api`. `VITE_API_BASE_URL` can point local development at your API. The optional AI integration is not required for enquiries, catalogue or admin operations.

## Verification

```sh
node --test tests/*.test.mjs
npm run build
python -m pip install -r requirements.txt pytest
python -m pytest backend/tests -q
node scripts/check-production.mjs
```

The last command performs credential-free, read-only checks of the live V2 site. Unit tests use fixtures; live checks and database access-control tests provide separate evidence.

## Deployment and recovery

Vercel builds the repository root with `npm run build` and serves `dist`, routing `/api/*` to the Python function. Verified changes to `main` trigger the linked deployment. GitHub quality checks are separate from Vercel builds; required deployment gates are not yet enforced.

Review migrations before applying them to the existing V2 database. Pushing SQL files does not execute them. Reverting frontend code does not reverse a database migration. Preserve the stock ledger and follow the recovery notes in the Supabase guide.

V1 and legacy MongoDB implementations remain preserved. Their authentication variables differ from Supabase V2; do not copy legacy configuration into production unintentionally. Never commit credentials, customer records or database backups.

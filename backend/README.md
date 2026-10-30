# Wipro V2 backend

`server.py` is the current FastAPI implementation. The Node server is retained for reference and uses a different contract; do not use it with the V2 frontend.

## Run

Use Python 3.12. Create a virtual environment, install `pip install -r backend/req.txt`, and populate `backend/.env` from `.env.example`. Start from the repository root with:

```sh
uvicorn backend.server:app --host 0.0.0.0 --port 8000
```

Production V2 uses `DATA_BACKEND=supabase`, server-only Supabase configuration and `JWT_SECRET` (at least 32 random bytes). Staff use Supabase Auth; never configure a plaintext production admin password. The retained local Mongo compatibility path requires `ADMIN_PASSWORD_HASH` in PBKDF2 format. See SECURITY.md.

The Vercel V2 project serves `/api` through `api/index.py`, using the same FastAPI application as standalone hosting. The API rewrite precedes the frontend fallback in `vercel.json`. Set private backend variables in the V2 Vercel project environment and redeploy. The original Render service remains separate. During local development Vite proxies `/api` to port 8000. Both `VITE_API_BASE_URL` and the older `VITE_API_URL` remain supported as optional full-origin overrides.

## Data flow

- POST `/api/contact` saves the service, message and structured quote items. The frontend requires a returned record ID before clearing the form.
- Admin login sets a Secure HttpOnly SameSite=Strict cookie and returns only staff identity, expiry and a CSRF token. Staff requests require an active shared session and current staff membership. Logout revokes the shared session.
- PATCH `/api/contact/{id}/status` is idempotent; supported values are `pending` and `contacted`.
- Products persist optional `stock`, `minStock`, `unit`, and `slug`. PATCH `/api/products/{id}` saves changes. An absent stock quantity is unknown, never randomly generated.
- GET `/api/products` excludes internal stock and threshold fields. GET `/api/admin/products` requires staff access and returns inventory. The public list extends the 40 original catalogue entries. `slug: catalog-<original numeric id>` explicitly links an inventory entry to an original product. Unlinked records appear as additional products. Deleting a linked record removes its override, preserving the original brochure item.
- Chat returns company information without an AI key. An AI provider failure does not prevent enquiries or admin access.

The health endpoint reports configuration and database connectivity without secrets. It returns 503 until both database and admin configuration are ready. Root `/api/` only confirms that the API process is running.

## Verification

```sh
pip install -r backend/requirements-dev.txt
python -m pytest backend/tests -q
node --test tests/*.test.mjs
npm run build
```

Tests use an isolated fake database. Production verification must additionally confirm a marked test enquiry in the admin view and a stock write/refetch in the intended database; passing tests alone does not prove live storage connectivity.

Supabase mode uses shared atomic Postgres budgets before parsing public POST requests. The local Mongo limiter remains per-process and is not a supported hosted authentication path. Do not trust arbitrary forwarded headers. This release does not send email notifications or migrate/delete existing customer data.

## Supabase staging

The API also supports `DATA_BACKEND=supabase`. See `supabase/README.md` for the
additive schema, RLS tests, staff provisioning and preview-first activation.
The default remains Mongo until Supabase configuration and live access tests pass.

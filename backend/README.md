# Wipro V2 backend

`server.py` is the current FastAPI implementation. The Node server is retained for reference and uses a different contract; do not use it with the V2 frontend.

## Run

Use Python 3.12. Create a virtual environment, install `pip install -r backend/req.txt`, and populate `backend/.env` from `.env.example`. Start from the repository root with:

```sh
uvicorn backend.server:app --host 0.0.0.0 --port 8000
```

For Render with root directory `backend`, the build command is `pip install -r req.txt`, and the start command is `uvicorn server:app --host 0.0.0.0 --port $PORT`. Use the health check path `/api/health` after configuration.

Required private settings: `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a randomly generated `JWT_SECRET` of at least 32 bytes. `MONGO_DB` defaults to the existing `wiprofire` database. Do not change the database name without deliberately selecting the intended data. AI credentials are optional. No credentials belong in GitHub or `VITE_` variables.

The Vercel frontend proxies `/api` to the existing Render hostname in `vercel.json`. Changing the backend hostname requires updating that rewrite and redeploying. During local development Vite proxies `/api` to port 8000. Both `VITE_API_BASE_URL` and the older `VITE_API_URL` remain supported as optional full-origin overrides.

## Data flow

- POST `/api/contact` saves the service, message and structured quote items. The frontend requires a returned record ID before clearing the form.
- Admin login returns an eight-hour bearer token. Enquiries and writes require a valid token.
- PATCH `/api/contact/{id}/status` is idempotent; supported values are `pending` and `contacted`.
- Products persist optional `stock`, `minStock`, `unit`, and `slug`. PATCH `/api/products/{id}` saves changes. An absent stock quantity is unknown, never randomly generated.
- GET `/api/products` extends the 40 original catalogue entries. `slug: catalog-<original numeric id>` explicitly links an inventory entry to an original product. Unlinked records appear as additional products. Deleting a linked record removes its override, preserving the original brochure item.
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

The built-in rate limiter is bounded and per process. Configure shared edge limits before scaling to multiple workers, and verify the platform's trusted-proxy settings so client IPs are identified correctly. Do not trust arbitrary forwarded headers. This release does not send email notifications or migrate/delete existing customer data.

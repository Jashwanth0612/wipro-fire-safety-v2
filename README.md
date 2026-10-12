# Wipro Fire & Safety — Version 2

Updated website with the original pages and product catalogue, searchable products, category filters, product details, quote shortlists, enquiry forms, responsive layouts and transparent company branding.

## Frontend

```sh
npm ci
npm run dev
```

Build with `npm run build`; output is in `dist`. Run frontend contract checks with `node --test tests/*.test.mjs`.

The frontend uses Vite and React. `VITE_API_BASE_URL` can override the API base URL; see `src/lib/api.js`.

## Backend

Both original backend implementations are retained under `backend/`. The Python FastAPI implementation provides the `/api/contact` endpoint used by this frontend; the Node implementation is an alternative legacy server.

Copy `backend/.env.example` to `backend/.env` and configure the database and admin credentials privately. The Gemini key is optional. Python requires `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `JWT_SECRET`. Node requires `ADMIN_PASSWORD` and `JWT_SECRET`, with optional `ADMIN_USERNAME`.

Hardcoded credentials and fallback signing secrets from the supplied source were replaced with environment variables before this public repository was created. Do not commit `.env` files or secrets. Configure the required variables before deploying either backend.

## Deployment

The frontend is configured for Vercel with an API proxy before the SPA fallback in `vercel.json`. All admin, enquiry, chat and catalogue requests share one API client. See [backend setup and verification](backend/README.md). Use the repository root as the build root, `npm run build` as the build command and `dist` as the output directory.

This repository is a separate version 2 copy. Creating it does not change the existing Vercel project's Git connection or the original repository.

See `UPGRADE_NOTES.md` for the visual and feature improvements.

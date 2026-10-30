# Where the website credentials live

V2 uses this connection: browser → Vercel Python API → Supabase.

Supabase supplies project API keys. During the authorized Supabase integration these were configured in the Vercel project's production environment. They are not ChatGPT or OpenAI API keys.

| Variable | Purpose | Verified Vercel storage |
| --- | --- | --- |
| `DATA_BACKEND` | Selects the active database provider | Production configuration |
| `SUPABASE_URL` | Identifies the Supabase project endpoint | Production configuration |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase API access used alongside user authentication | Sensitive production variable |
| `SUPABASE_SECRET_KEY` | Privileged server operations, validated enquiries, readiness, private session and abuse-control RPCs | Sensitive production variable |

The application reads these variables in `backend/supabase_store.py`. They do not use the `VITE_` prefix and are not part of the frontend configuration. Staff requests use the signed-in user's token plus database access policies. The privileged key stays in the server environment.

View the names in **Vercel → wipro-fire-safety-v2 → Settings → Environment Variables**. Do not paste key values into chat, GitHub issues, screenshots or frontend code. Git stores setup instructions and empty example variables, not the production values.

The October 2026 metadata check found no `OPENAI_API_KEY` or `GEMINI_API_KEY` configured. The website assistant therefore uses the company-information responses in the backend; it is not connected to a ChatGPT subscription or a paid AI model through those variables.

JWT_SECRET now signs HttpOnly web sessions and HMAC-bound CSRF/rate keys; it remains server-only. Legacy MongoDB configuration remains stored for the retained implementation. Their presence does not mean V2 is using MongoDB: `DATA_BACKEND` selects the active provider. Removing unused credentials should be handled as a separate, verified cleanup.

Metadata was inspected without decrypting or displaying credential values. This document records the configuration boundary; it is not a guarantee that all security reviews are complete.

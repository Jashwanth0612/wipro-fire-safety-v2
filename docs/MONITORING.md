# Production monitoring and incident response

## What runs

`Production health` in GitHub Actions runs hourly at minute 23 UTC, manually via **Run workflow**, and when its checker or workflow changes on `main`. It checks the canonical production website, not the deployment for the triggering commit. It needs no application credentials and grants the workflow only repository read access.

The checker verifies:

- Public route HTML and the current JavaScript/CSS entry bundles.
- Browser security headers on the home page.
- API readiness, Supabase connectivity and configured staff access.
- A nonempty catalogue with expected basic fields.
- Anonymous denial and no-store caching for enquiry reads and stock history.

Each run exits unsuccessfully if any check fails and publishes only route names and pass/fail status. It never logs response bodies, tokens, customer details or database records. Requests have 15-second timeouts and do not follow redirects.

## Reading a failure

Open the repository's **Actions → Production health** and inspect the run summary. Re-run once to distinguish a brief interruption from a persistent problem, then inspect the relevant Vercel deployment and authorized service logs. A failed check is an investigation signal; it is not by itself proof of an attack.

1. If public pages fail, inspect the current Vercel deployment/build and domain routing.
2. If a bundle fails, investigate missing assets, content types and stale HTML.
3. If health fails, inspect database availability and server configuration without printing secrets.
4. If catalogue validation fails, inspect API errors and schema compatibility; do not reseed or overwrite existing business records automatically.
5. If an anonymous-protection check fails, prioritize the affected access control and investigate possible exposure. Do not copy returned private data into an issue or public log.
6. Fix and test the cause, verify production, and record the incident and recovery evidence in the checklist. Preserve database history during rollback.

## Limits and next work

HTTP route checks verify the SPA shell, not rendered React content or interactive form completion. They do not test signed-in operations, email delivery, backups, every image, latency percentiles or browser accessibility. Those require separate checks.

GitHub schedules are best effort and can be delayed. Public-repository schedules may be disabled after 60 days without repository activity. Check recent run timestamps during the daily project review. This is periodic monitoring, not a guaranteed 24/7 alert service.

Workflow failures are visible in GitHub; notification delivery depends on the owner's GitHub notification settings and has not been verified. No email, SMS, paid monitoring service or new recipient is configured by this workflow. Dedicated alert routing, controlled delivery tests and recovery notifications remain pending.

Official scheduling reference: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

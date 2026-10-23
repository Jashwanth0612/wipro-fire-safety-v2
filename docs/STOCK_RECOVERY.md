# Recovering an uncertain stock update

If a request loses its network response, its outcome may be unknown even when the database saved it. The staff form now saves the exact request before sending it and retries with the same request ID. The existing atomic database function returns the original movement instead of applying it twice.

## Staff workflow

1. Keep the original tab open and use **Retry same entry safely**.
2. If the session expires, sign back in with the same staff account in that tab and return to Products. The pending entry is restored.
3. Do not create a second entry for the same delivery on another tab or device. If the tab was closed or browser data was cleared, review movement history and the delivery reference first.
4. A confirmed rejection unlocks the form for correction. A timeout, unavailable server, expired session or unconfirmed response retains the entry.
5. If browser storage cannot save the recovery copy, the application does not send a new stock mutation. Resolve the browser storage issue first.

## Data and authorization

The recovery copy uses session storage scoped to the browser tab and staff user ID. It holds the request ID, product ID, action, quantity, expected stock, reference and optional note. It contains no API key, password or session token. It is cleared after confirmation or a conclusive rejection, and normally disappears when the tab closes. It survives sign-out in the same tab so the same account can recover an uncertain request; another account does not load it.

This is not encrypted storage or an authorization mechanism. Same-origin scripts and anyone with access to the browser profile can inspect it. The user ID parsed from the session token is only a namespace; the API and database still authenticate the token and verify staff membership. Existing session-token storage and the planned HttpOnly-session review are unchanged.

The UI does not automatically resend after reload. Staff explicitly retry. A browser navigation warning is best-effort only; browsers may suppress it. Cross-device or closed-tab recovery and duplicate business-document detection remain future work.

## Verification and rollback

`tests/stock-recovery.test.mjs` covers response loss after commit, restored requests with renewed tokens, auth/network/server errors, malformed responses, rejection cleanup, blocked/corrupt storage, account separation, conflicting pending entries and failed cleanup. These use synthetic fixtures and do not change business stock.

No database migration or environment variable is required. A rollback to the preceding UI remains compatible with the current database, but the old UI cannot read this recovery copy. Resolve outstanding requests by checking history before rolling back or entering another delivery.

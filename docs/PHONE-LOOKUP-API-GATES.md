# Phone lookup API — design gates (no live endpoints)

This branch currently contains **no phone lookup API routes**. `src/lib/phone-lookup/api-contract.ts` is pure, offline, demo-only validation.

## Proposed future endpoints — NOT IMPLEMENTED
- POST /api/phone-lookup/reports — requires authentication/abuse controls, verified lawful basis, strict schema, server-derived pending state, rate limiting and anti-enumeration controls.
- GET /api/admin/phone-lookup/reports — requires server-side administrator authorization and least-privilege pagination.
- POST /api/admin/phone-lookup/reports/{id}/decision — requires administrator authorization, CSRF/origin protection, audit trail, idempotency and transition validation.
- POST /api/phone-lookup/privacy-requests — requires a secure private intake channel and identity verification without unnecessary disclosure.

## Must pass before implementation
1. Verify Preview DATABASE_URL is Neon xucuz-preview, not main; do not expose secrets.
2. Define retention, deletion, HMAC secret management, lawful basis and moderation appeal procedure.
3. Choose durable, shared rate limiting and anti-bot defenses; current app in-memory counters are insufficient for scaled use.
4. Define verified, opt-in business publication and revocation workflow.
5. Confirm data handling and KVKK notices with counsel.
6. Ensure all new routes default disabled and are excluded from indexing, logs and analytics containing phone numbers.
7. Run lint, typecheck, unit tests, build and E2E before any deployment.

No Production, database, migration, Vercel setting or environment change is authorized by this document.

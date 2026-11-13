# Phone lookup data-model review — NOT FOR DEPLOYMENT

This document accompanies `src/db/phone-lookup-schema.draft.ts`. The draft is intentionally NOT referenced by the application's active Drizzle schema and has NOT been migrated.

## Safeguards before activation
1. Obtain a documented lawful basis and counsel review for each category of data, including complaint data and business publication. An OTP check alone does not establish publication permission.
2. Define an approved retention schedule and automated deletion of expired reports, with separately controlled audit retention. No retention duration has yet been approved.
3. Derive phone digests with a secret server-side keyed HMAC and design key rotation and breach response. Ordinary hashing is vulnerable to enumeration of phone-number space. Restrict digest-based lookup endpoints and never expose digests.
4. Implement server-side authentication and rate limiting, bot defenses, abuse detection, and moderation permissions. Avoid open phone-number enumeration.
5. Verify business ownership, legal authority to publish, and explicit publication permission. Honor revocation promptly.
6. Keep complaints nonpublic until human moderation. Provide notice, challenge/correction/removal workflows, and prohibit definitive allegations.
7. Verify Vercel Preview database connection maps to Neon `xucuz-preview` before approving migrations. Never migrate Production as part of this work.
8. Perform privacy impact review, access logging, and threat modeling. Define a secure request intake channel before enabling privacy requests.
9. Add migration review, integration tests and rollback procedures in a separate approval stage.

## Scope of this commit
Schema design and documentation only. No database connection, API, SMS integration, live data, migration, deploy, or Production change.

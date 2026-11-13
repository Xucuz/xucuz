# Xucuz Phone Lookup — isolated implementation plan

Status: planning only. Branch: `feat/phone-lookup`, created from `feat/community-price-platform`.

## Boundaries
- Do not modify `main`, Production, Vercel settings, environment variables, or existing pricing features.
- Do not deploy or run database migrations. Preview DATABASE_URL mapping to Neon `xucuz-preview` is not yet verified.
- No imported contact books, third-party address books, scraped identity datasets, or inferred subscriber names.
- A verified phone number does not alone authorize public disclosure of its owner's name. Only display data with documented lawful basis and publication permission, subject to legal review.

## Repository observations
- Next.js 16, React 19, TypeScript, Tailwind 4, Drizzle ORM and PostgreSQL.
- Current schema: `src/db/schema.ts`; configuration: `drizzle.config.ts`.
- Existing admin page: `src/app/admin/page.tsx`, using `isAdmin()`.
- Global navigation: `src/app/layout.tsx`.
- Checks available: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`.

## Implementation stages
1. Add an isolated, feature-flagged `/numara-sorgulama` UI with synthetic examples and clear demo labeling. Default flag OFF. Avoid altering shared navigation until reviewed.
2. Implement Turkish E.164 normalization and validation with unit tests; never expose arbitrary phone numbers in analytics, URL query strings, logs, or SEO pages.
3. Design a separate phone module and Drizzle schema/migration draft, without applying it. Tables: verified public profiles, consent/publication permissions, spam reports, ownership verification challenges, privacy requests, moderation events and audit records. Define retention and deletion policies before collecting real data.
4. Build server-side rate limiting, anti-enumeration safeguards, bot protection, abuse monitoring, access controls and moderated reports. Avoid definitive criminal allegations or unverified identity claims.
5. Add privacy request workflows (access, correction, removal), explicit notice, lawful basis review and legal sign-off before any live data ingestion.
6. Test accessibility, mobile UI, existing pricing flows, admin authorization, data minimization and no-leak conditions. Use synthetic fixtures only.

## Release gates
- Confirm Preview database hostname maps to Neon `xucuz-preview` without revealing secrets.
- Require separate approval for migrations, third-party SMS services, real data ingestion, Vercel Preview deployment, and any Production release.
- Review KVKK requirements and report handling with qualified counsel.
- Keep the feature disabled until security, privacy and regression checks pass.

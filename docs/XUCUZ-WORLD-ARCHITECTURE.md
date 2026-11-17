# XUCUZ WORLD — first implementation architecture

## Repository audit (2026-11-17)

- Base: GitHub `Xucuz/xucuz`, `feat/xucuz-world-rebuild`, created from `main` at `1099211`.
- Runtime: Next.js 16 App Router, React 19, TypeScript, npm (`package-lock.json`), Vercel `npm ci` + `npm run build`.
- Persistence: PostgreSQL through `postgres` + Drizzle. Existing tables cover catalog/providers/offers, approved community price observations, visitor metrics, and nickname chat. There are no Passport or country catalog tables.
- Authentication: existing admin HMAC cookie and chat-member sessions. No general consumer account/session system is present.
- Vercel: project `xucuz`; production history points to `feat/xucuz-enterprise-all-pages`. The requested branch remains separate. Repository configuration sets Next.js framework/install/build/output only. No environment values or secrets were read or changed.
- Current integrations: verified Turkish community prices are database-backed; travel/global retail APIs and a generative model are not configured in source.

## First release scope

1. Replace the homepage with a responsive XUCUZ WORLD overview and navigation to AI, Passport, Travel, Market, Business, and Radar.
2. Add TR/EN/RU interface copy and a TRY/USD/EUR/GBP preference selector. A currency choice is only a display preference; it does not imply conversion or availability of live quotes.
3. Add a server-only AI Gateway route for general assistant questions. If Gateway auth is absent, return a clear unavailable response. Price-intent questions bypass model generation and use only current, approved database observations; when none are available, return that state without a fabricated amount.
4. Add a Passport MVP with a public-domain Natural Earth map and a curated starter list of destinations. User-selected stamps are stored locally on that device, not presented as account-synced or GPS-verified travel.
5. Keep travel, international market feeds, alerts, full account/dashboard, and admin workflows as clearly labeled integration stages. Do not show invented listings or prices.

## Data and migration safety

- No database migration is required for this first release. Existing migrations and data remain untouched.
- Passport state uses a versioned browser-local storage key. No personal location is collected.
- AI prompts are sent to Vercel AI Gateway only when configured. Chat is not persisted by this app. Do not send credentials or sensitive personal information in prompts.
- `AI_GATEWAY_MODEL` selects the model; `AI_GATEWAY_API_KEY` or Vercel OIDC authenticates it. The key must be configured as a secret in Vercel Preview, never committed.

## Later phases

- Add server-backed Passport/user accounts only after the account and retention design is approved; then add migrations on an isolated Preview database.
- Connect licensed/contracted travel and retail providers, then expose source, currency, timestamp, territory, and fees for every quote.
- Build price alerts and dashboards only after the data sources and notification channels are operational.

# Xucuz — Awin-inspired redesign (Preview only)

## Product decision
Rebuild the public website around a free partnership network while preserving the existing price-comparison experience. Awin is a functional reference, not a source of copyrighted copy, layout assets, or branding. The original blue genie emerging from a golden lamp is named **Xucuz**; his shirt says **XUcuz**.

## Commercial rules
- Merchant, publisher, influencer and agency signup: free.
- Xucuz platform fees, subscription fees, and network commissions: zero.
- Merchants may voluntarily offer publisher commissions. Xucuz does not retain a percentage.
- Do not promise free hosting, payment processing, or third-party services.

## Information architecture
- / — redesigned partnership-network homepage, discovery, clear calls to action, mascot.
- /magazalar — advertiser benefits and onboarding.
- /yayincilar — publisher benefits and onboarding.
- /icerik-ureticileri — creator and influencer partnerships.
- /ajanslar — agency information.
- /is-ortaklari — searchable merchant and campaign directory.
- /kampanyalar — campaign listings and conditions.
- /panel/magaza — merchant dashboard (authenticated).
- /panel/yayinci — publisher dashboard (authenticated).
- /panel/ajans — agency dashboard (authenticated).
- /admin — moderation, reporting, fraud review.
- Existing search, price comparison, product guides, and Xucina chat must remain functional until replacement is explicitly tested. The assistant may be renamed Xucuz in a separate compatibility-safe change.
- /hakkimizda, /iletisim, /yardim, /gizlilik, /kvkk, /kullanim-kosullari.

## Architecture and security gates
1. Audit existing routes, UI components, authentication, Drizzle schema, migrations and tests.
2. Build responsive navigation and accessible marketing pages with truthful demo/empty states; never fabricate merchants, sales or prices.
3. Implement merchant/publisher roles and approval workflows with server-side authorization.
4. Implement campaign application, unique tracking links, consent-aware click and conversion tracking, duplicate/fraud protection and merchant-confirmed conversions.
5. Implement transparent commission ledger with optional merchant-to-publisher direct settlement; do not hold or transfer money without legal/payment review.
6. Add dashboards, audit logs, abuse controls, privacy notices, data retention and deletion.
7. Validate unit, integration, E2E, accessibility, SEO and mobile tests in Preview.
8. No production deployment, secret changes or migrations without a separate review and authorization.

## Delivery
Work on `feat/awin-inspired-redesign`. Open a PR and verify Vercel Preview before any production merge. Preserve existing user data and URLs with redirects where needed.

## Mascot
Use an original owned/licensed image asset before embedding the genie in the site. Do not hotlink transient chat attachments or reuse another brand's character assets.

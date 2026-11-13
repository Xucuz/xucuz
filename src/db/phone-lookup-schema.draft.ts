/**
 * DESIGN DRAFT ONLY — not imported by src/db/schema.ts or drizzle.config.ts.
 * No migration generated or applied. Do not activate until legal/security review.
 * Identifiers must be keyed HMAC digests (not plain SHA-256), using server-only secrets.
 * Store no raw phone numbers in this draft. No lookup API is implemented.
 */
import {pgTable,text,timestamp,index,boolean} from 'drizzle-orm/pg-core';

export const phoneBusinessProfilesDraft=pgTable('phone_business_profiles_draft',{
 id:text().primaryKey(),
 phoneDigest:text('phone_digest').notNull().unique(),
 businessDisplayName:text('business_display_name').notNull(),
 ownershipVerifiedAt:timestamp('ownership_verified_at',{withTimezone:true}),
 publicationAuthorized:boolean('publication_authorized').notNull().default(false),
 publicationAuthorizedAt:timestamp('publication_authorized_at',{withTimezone:true}),
 revokedAt:timestamp('revoked_at',{withTimezone:true}),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
});

export const phoneSpamReportsDraft=pgTable('phone_spam_reports_draft',{
 id:text().primaryKey(),
 phoneDigest:text('phone_digest').notNull(),
 category:text().notNull(),
 status:text().notNull().default('pending'),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
 reviewedAt:timestamp('reviewed_at',{withTimezone:true}),
 expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
},t=>[index('phone_reports_review_draft_idx').on(t.status,t.createdAt),index('phone_reports_expiry_draft_idx').on(t.expiresAt)]);

export const phonePrivacyRequestsDraft=pgTable('phone_privacy_requests_draft',{
 id:text().primaryKey(),
 requestType:text('request_type').notNull(),
 status:text().notNull().default('pending'),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
 resolvedAt:timestamp('resolved_at',{withTimezone:true}),
},t=>[index('phone_privacy_requests_draft_idx').on(t.status,t.createdAt)]);

export const phoneModerationEventsDraft=pgTable('phone_moderation_events_draft',{
 id:text().primaryKey(),
 reportId:text('report_id').notNull(),
 action:text().notNull(),
 moderatorRef:text('moderator_ref').notNull(),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
});

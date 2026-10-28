CREATE TABLE "community_price_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"product_key" text NOT NULL,
	"brand" text,
	"variant" text,
	"barcode" text,
	"store" text NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"price_kurus" integer NOT NULL,
	"currency" text DEFAULT 'TRY' NOT NULL,
	"package_value" numeric(12, 3),
	"unit" text,
	"pack_count" integer DEFAULT 1 NOT NULL,
	"campaign" text,
	"observed_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	CONSTRAINT "community_price_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected')),
	CONSTRAINT "community_price_currency_check" CHECK ("currency" = 'TRY'),
	CONSTRAINT "community_price_amount_check" CHECK ("price_kurus" > 0 AND "price_kurus" <= 100000000),
	CONSTRAINT "community_price_pack_count_check" CHECK ("pack_count" > 0 AND "pack_count" <= 1000)
);
--> statement-breakpoint
CREATE TABLE "community_price_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"observation_id" text NOT NULL REFERENCES "community_price_observations"("id") ON DELETE CASCADE,
	"kind" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_length" integer NOT NULL,
	"content" bytea NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_evidence_kind_check" CHECK ("kind" IN ('receipt', 'shelf', 'product')),
	CONSTRAINT "community_evidence_mime_check" CHECK ("mime_type" IN ('image/jpeg', 'image/png', 'image/webp')),
	CONSTRAINT "community_evidence_size_check" CHECK ("byte_length" > 0 AND "byte_length" <= 5000000)
);
--> statement-breakpoint
CREATE INDEX "community_prices_public_search_idx" ON "community_price_observations" USING btree ("status", "product_key", "city", "expires_at");
--> statement-breakpoint
CREATE INDEX "community_prices_moderation_idx" ON "community_price_observations" USING btree ("status", "submitted_at");
--> statement-breakpoint
CREATE INDEX "community_evidence_observation_idx" ON "community_price_evidence" USING btree ("observation_id");

CREATE TABLE "accommodations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"location" jsonb,
	"attributes" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_runs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"providerId" text NOT NULL,
	"status" text NOT NULL,
	"rowCount" integer NOT NULL,
	"report" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"departsAt" timestamp with time zone,
	"operator" text NOT NULL,
	"serviceCode" text NOT NULL,
	"attributes" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matching_issues" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "matching_issues_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"importId" integer,
	"sourceId" text NOT NULL,
	"reason" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"providerId" text NOT NULL,
	"entityId" text NOT NULL,
	"variantKey" text NOT NULL,
	"currency" text NOT NULL,
	"price" bigint NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_observations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "price_observations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"offerId" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" text NOT NULL,
	"observedAt" timestamp with time zone NOT NULL,
	"demo" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"modelCode" text,
	"gtin" text
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"allowedHosts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"documentationUrl" text,
	"permissionReference" text,
	"verifiedAt" timestamp with time zone,
	"lastSyncAt" timestamp with time zone,
	"lastError" text
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"matchKey" text NOT NULL,
	"attributes" jsonb NOT NULL,
	CONSTRAINT "variants_matchKey_unique" UNIQUE("matchKey")
);
--> statement-breakpoint
CREATE TABLE "vehicle_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceId" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"mileage" integer NOT NULL,
	"attributes" jsonb NOT NULL,
	CONSTRAINT "vehicle_listings_sourceId_unique" UNIQUE("sourceId")
);
--> statement-breakpoint
ALTER TABLE "matching_issues" ADD CONSTRAINT "matching_issues_importId_import_runs_id_fk" FOREIGN KEY ("importId") REFERENCES "public"."import_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_providerId_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_offerId_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offers_search_idx" ON "offers" USING btree ("category","providerId","updatedAt");--> statement-breakpoint
CREATE INDEX "offers_entity_idx" ON "offers" USING btree ("entityId","variantKey");--> statement-breakpoint
CREATE INDEX "products_gtin_idx" ON "products" USING btree ("gtin");
CREATE TABLE IF NOT EXISTS monthly_visitors (
 month text NOT NULL,
 visitor_hash text NOT NULL,
 PRIMARY KEY (month, visitor_hash)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS monthly_visitor_totals (
 month text PRIMARY KEY,
 visitors bigint NOT NULL DEFAULT 0 CHECK (visitors >= 0)
);

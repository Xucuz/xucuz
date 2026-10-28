CREATE TABLE IF NOT EXISTS yearly_visitors (
 year text NOT NULL,
 visitor_hash text NOT NULL,
 PRIMARY KEY (year, visitor_hash)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS yearly_visitor_totals (
 year text PRIMARY KEY,
 visitors bigint NOT NULL DEFAULT 0 CHECK (visitors >= 0),
 started_at timestamptz NOT NULL DEFAULT now()
);
-- Intentionally no monthly-data backfill and no synthetic starting visitors.

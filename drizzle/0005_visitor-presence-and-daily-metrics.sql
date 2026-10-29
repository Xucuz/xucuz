CREATE TABLE IF NOT EXISTS daily_visitors (
 day text NOT NULL,
 visitor_hash text NOT NULL,
 PRIMARY KEY (day, visitor_hash)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS daily_visitor_totals (
 day text PRIMARY KEY,
 visitors bigint NOT NULL DEFAULT 0 CHECK (visitors >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS online_presence (
 session_hash text PRIMARY KEY,
 last_seen_at timestamptz NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS online_presence_last_seen_idx ON online_presence(last_seen_at);

/** Keep serverless PostgreSQL clients small; Neon pooled connections fan in many instances. */
export const DB_POOL_MAX_CONNECTIONS = 1;

/** Poll chat only while its panel is open, with a bounded interval. */
export const LIVE_CHAT_POLL_INTERVAL_MS = 10_000;
export const LIVE_CHAT_INITIAL_HISTORY_LIMIT = 20;

/** Presence is approximate; a 30s heartbeat is enough for an online indicator. */
export const PRESENCE_HEARTBEAT_INTERVAL_MS = 30_000;

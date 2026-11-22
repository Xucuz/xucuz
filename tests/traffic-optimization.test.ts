import { describe, expect, it } from 'vitest';
import {
  DB_POOL_MAX_CONNECTIONS,
  LIVE_CHAT_INITIAL_HISTORY_LIMIT,
  LIVE_CHAT_POLL_INTERVAL_MS,
  PRESENCE_HEARTBEAT_INTERVAL_MS,
} from '@/lib/traffic-optimization';

describe('Neon traffic safeguards', () => {
  it('keeps each serverless PostgreSQL pool to one connection', () => {
    expect(DB_POOL_MAX_CONNECTIONS).toBe(1);
  });

  it('bounds chat history and avoids rapid background polling', () => {
    expect(LIVE_CHAT_INITIAL_HISTORY_LIMIT).toBe(20);
    expect(LIVE_CHAT_POLL_INTERVAL_MS).toBe(5_000);
  });

  it('uses a bounded heartbeat interval for approximate online presence', () => {
    expect(PRESENCE_HEARTBEAT_INTERVAL_MS).toBe(30_000);
  });
});

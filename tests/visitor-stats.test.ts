import {describe,it,expect,vi,afterEach} from 'vitest';
import {visitorMonth,visitorHash,metricsConfigured} from '../src/lib/visitor-stats';
afterEach(()=>vi.unstubAllEnvs());
describe('monthly visitor identity',()=>{
 it('uses Istanbul calendar month',()=>{expect(visitorMonth(new Date('2026-10-31T22:00:00Z'))).toBe('2026-11');expect(visitorMonth(new Date('2026-10-31T20:00:00Z'))).toBe('2026-10');});
 it('does not keep raw identity and separates months',()=>{const secret='s'.repeat(32);const hash=visitorHash('browser-id','2026-10',secret);expect(hash).toMatch(/^[a-f0-9]{64}$/);expect(hash).toBe(visitorHash('browser-id','2026-10',secret));expect(hash).not.toBe(visitorHash('browser-id','2026-11',secret));expect(()=>visitorHash('id','2026-10','short')).toThrow();});
 it('requires actual database and private key and supports kill switch',()=>{vi.stubEnv('DATABASE_URL','');vi.stubEnv('VISITOR_METRICS_SECRET','s'.repeat(32));expect(metricsConfigured()).toBe(false);vi.stubEnv('DATABASE_URL','postgres://test');vi.stubEnv('VISITOR_METRICS_ENABLED','1');expect(metricsConfigured()).toBe(true);vi.stubEnv('VISITOR_METRICS_ENABLED','0');expect(metricsConfigured()).toBe(false);});
});

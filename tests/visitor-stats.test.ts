import {describe,it,expect,vi,afterEach} from 'vitest';
import {visitorDay,visitorYear,visitorHash,metricsConfigured} from '../src/lib/visitor-stats';
afterEach(()=>vi.unstubAllEnvs());
describe('yearly visitor identity',()=>{
 it('uses Istanbul calendar year',()=>{expect(visitorYear(new Date('2026-12-31T22:00:00Z'))).toBe('2027');expect(visitorYear(new Date('2026-12-31T20:00:00Z'))).toBe('2026');});
 it('uses Istanbul calendar day for daily unique visits',()=>{expect(visitorDay(new Date('2026-12-31T21:00:00Z'))).toBe('2027-01-01');expect(visitorDay(new Date('2026-12-31T20:59:59Z'))).toBe('2026-12-31');});
 it('does not keep raw identity and separates years',()=>{const secret='s'.repeat(32);const hash=visitorHash('browser-id','2026',secret);expect(hash).toMatch(/^[a-f0-9]{64}$/);expect(hash).toBe(visitorHash('browser-id','2026',secret));expect(hash).not.toBe(visitorHash('browser-id','2027',secret));expect(()=>visitorHash('id','2026','short')).toThrow();});
 it('requires actual database and private key and supports kill switch',()=>{vi.stubEnv('DATABASE_URL','');vi.stubEnv('VISITOR_METRICS_SECRET','s'.repeat(32));expect(metricsConfigured()).toBe(false);vi.stubEnv('DATABASE_URL','postgres://test');vi.stubEnv('VISITOR_METRICS_ENABLED','1');expect(metricsConfigured()).toBe(true);vi.stubEnv('VISITOR_METRICS_ENABLED','0');expect(metricsConfigured()).toBe(false);});
});

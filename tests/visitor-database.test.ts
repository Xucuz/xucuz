import {it,expect,afterAll} from 'vitest';
import {randomUUID} from 'node:crypto';
import {sql} from '../src/db';
import {recordVisitor,readVisitors} from '../src/lib/visitor-store';
import {visitorHash,visitorYear} from '../src/lib/visitor-stats';
it.skipIf(!process.env.DATABASE_URL)('counts concurrent repeat visits once and persists aggregate in PostgreSQL',async()=>{const id=randomUUID(),secret='test-only-metrics-secret-32-characters',year=visitorYear();const before=await readVisitors();try{await Promise.all([recordVisitor(id,secret),recordVisitor(id,secret),recordVisitor(id,secret)]);expect((await readVisitors()).count).toBe(before.count+1);const rows=await sql`select visitor_hash from yearly_visitors where year=${year} and visitor_hash=${visitorHash(id,year,secret)}`;expect(rows).toHaveLength(1);await recordVisitor(id,secret);expect((await readVisitors()).count).toBe(before.count+1);}finally{await sql`delete from yearly_visitors where year=${year} and visitor_hash=${visitorHash(id,year,secret)}`;await sql`update yearly_visitor_totals set visitors=${before.count} where year=${year}`;}});
afterAll(()=>sql.end());

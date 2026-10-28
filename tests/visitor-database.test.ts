import {it,expect,afterAll} from 'vitest';
import {randomUUID} from 'node:crypto';
import {sql} from '../src/db';
import {recordVisitor,readVisitors} from '../src/lib/visitor-store';
import {visitorHash,visitorMonth} from '../src/lib/visitor-stats';
it.skipIf(!process.env.DATABASE_URL)('counts concurrent repeat visits once and persists aggregate in PostgreSQL',async()=>{const id=randomUUID(),secret='test-only-metrics-secret-32-characters',month=visitorMonth();const before=await readVisitors();try{await Promise.all([recordVisitor(id,secret),recordVisitor(id,secret),recordVisitor(id,secret)]);expect((await readVisitors()).count).toBe(before.count+1);const rows=await sql`select visitor_hash from monthly_visitors where month=${month} and visitor_hash=${visitorHash(id,month,secret)}`;expect(rows).toHaveLength(1);await recordVisitor(id,secret);expect((await readVisitors()).count).toBe(before.count+1);}finally{await sql`delete from monthly_visitors where month=${month} and visitor_hash=${visitorHash(id,month,secret)}`;await sql`update monthly_visitor_totals set visitors=${before.count} where month=${month}`;}});
afterAll(()=>sql.end());

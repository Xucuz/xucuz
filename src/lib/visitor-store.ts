import {sql} from '@/db';
import {visitorHash,visitorYear} from './visitor-stats';
export async function readVisitors(now=new Date()){const year=visitorYear(now);const rows=await sql`select visitors,started_at from yearly_visitor_totals where year=${year}`;return {year,count:Number(rows[0]?.visitors??0),startedAt:rows[0]?.started_at?new Date(rows[0].started_at).toISOString():null,measuredAt:now.toISOString()};}
export async function recordVisitor(id:string,secret:string,now=new Date()){const year=visitorYear(now);const hash=visitorHash(id,year,secret);await sql.begin(async tx=>{await tx`set local statement_timeout = '3000ms'`;const inserted=await tx`insert into yearly_visitors(year,visitor_hash) values (${year},${hash}) on conflict do nothing returning year`;if(inserted.length){await tx`insert into yearly_visitor_totals(year,visitors) values (${year},1) on conflict(year) do update set visitors=yearly_visitor_totals.visitors+1`;}
 // Keep only current-year pseudonymous identifiers; aggregate totals remain.
 await tx`delete from yearly_visitors where year < ${year}`;
 });return readVisitors(now);}

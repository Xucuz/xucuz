import {sql} from '@/db';
import {visitorHash,visitorMonth} from './visitor-stats';
export async function readVisitors(now=new Date()){const month=visitorMonth(now);const rows=await sql`select visitors from monthly_visitor_totals where month=${month}`;return {month,count:Number(rows[0]?.visitors??0),measuredAt:now.toISOString()};}
export async function recordVisitor(id:string,secret:string,now=new Date()){const month=visitorMonth(now);const hash=visitorHash(id,month,secret);await sql.begin(async tx=>{await tx`set local statement_timeout = '3000ms'`;const inserted=await tx`insert into monthly_visitors(month,visitor_hash) values (${month},${hash}) on conflict do nothing returning month`;if(inserted.length){await tx`insert into monthly_visitor_totals(month,visitors) values (${month},1) on conflict(month) do update set visitors=monthly_visitor_totals.visitors+1`;}
 // Keep only current-month pseudonymous identifiers; aggregate totals remain.
 await tx`delete from monthly_visitors where month < ${month}`;
 });return readVisitors(now);}

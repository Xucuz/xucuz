import {sql} from '@/db';
import {visitorHash,visitorYear,visitorDay} from './visitor-stats';
export async function readVisitors(now=new Date()){const year=visitorYear(now);const rows=await sql`select visitors,started_at from yearly_visitor_totals where year=${year}`;return {year,count:Number(rows[0]?.visitors??0),startedAt:rows[0]?.started_at?new Date(rows[0].started_at).toISOString():null,measuredAt:now.toISOString()};}
export async function recordVisitor(id:string,secret:string,now=new Date()){const year=visitorYear(now);const hash=visitorHash(id,year,secret);await sql.begin(async tx=>{await tx`set local statement_timeout = '3000ms'`;const inserted=await tx`insert into yearly_visitors(year,visitor_hash) values (${year},${hash}) on conflict do nothing returning year`;if(inserted.length){await tx`insert into yearly_visitor_totals(year,visitors) values (${year},1) on conflict(year) do update set visitors=yearly_visitor_totals.visitors+1`;}
 // Keep only current-year pseudonymous identifiers; aggregate totals remain.
 await tx`delete from yearly_visitors where year < ${year}`;
 });return readVisitors(now);}

export async function readDailyVisitors(now=new Date()){
 const day=visitorDay(now);
 const rows=await sql`select visitors from daily_visitor_totals where day=${day}`;
 return {day,count:Number(rows[0]?.visitors??0),measuredAt:now.toISOString(),timeZone:'Europe/Istanbul'};
}
export async function recordDailyVisitor(id:string,secret:string,now=new Date()){
 const day=visitorDay(now);const hash=visitorHash(id,day,secret);
 await sql.begin(async tx=>{
  await tx`set local statement_timeout = '3000ms'`;
  const inserted=await tx`insert into daily_visitors(day,visitor_hash) values (${day},${hash}) on conflict do nothing returning day`;
  if(inserted.length)await tx`insert into daily_visitor_totals(day,visitors) values (${day},1) on conflict(day) do update set visitors=daily_visitor_totals.visitors+1`;
  await tx`delete from daily_visitors where day < ${visitorDay(new Date(now.getTime()-2*86400000))}`;
  await tx`delete from online_presence where last_seen_at < ${new Date(now.getTime()-2*86400000)}`;
  await tx`delete from daily_visitor_totals where day < ${visitorDay(new Date(now.getTime()-400*86400000))}`;
 });
 return readDailyVisitors(now);
}
export async function readOnlinePresence(now=new Date()){
 const cutoff=new Date(now.getTime()-75_000);
 const rows=await sql`select count(*)::int as count from online_presence where last_seen_at > ${cutoff}`;
 return {onlineCount:Number(rows[0]?.count??0),measuredAt:now.toISOString()};
}
export async function heartbeatOnlinePresence(id:string,secret:string,now=new Date()){
 const hash=visitorHash(id,'online',secret);
 await sql.begin(async tx=>{
  await tx`set local statement_timeout = '3000ms'`;
  await tx`insert into online_presence(session_hash,last_seen_at) values (${hash},${now}) on conflict(session_hash) do update set last_seen_at=excluded.last_seen_at`;
  await tx`delete from online_presence where last_seen_at < ${new Date(now.getTime()-75_000)}`;
 });
 return readOnlinePresence(now);
}

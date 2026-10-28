import {z} from 'zod';
const snapshotSchema=z.object({month:z.string().regex(/^\d{4}-\d{2}$/),visitors:z.number().int().min(0).max(999999999),measuredAt:z.iso.datetime(),source:z.string().trim().min(1).max(200)});
// Only a dated, current-month measurement may populate the public template.
// This module does not collect visits or generate a count.
export function monthlyVisitors(raw=process.env.VISITOR_STATS_SNAPSHOT,now=new Date()){
 if(!raw)return null;
 try{const parsed=snapshotSchema.safeParse(JSON.parse(raw));if(!parsed.success)return null;const s=parsed.data;const month=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(now);const age=now.getTime()-Date.parse(s.measuredAt);if(s.month!==month||age<0||age>48*60*60*1000)return null;return {count:s.visitors,measuredAt:s.measuredAt};}catch{return null;}
}

import {NextResponse} from 'next/server';
import {apiFootballFailureStatus,logApiFootballFailure} from '@/lib/api-football-diagnostics';

export const dynamic='force-dynamic';
type EventRow={time?:{elapsed?:number|null;extra?:number|null};team?:{name?:string|null};player?:{name?:string|null};assist?:{name?:string|null};type?:string;detail?:string;comments?:string|null};
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^\d{1,12}$/.test(id))return NextResponse.json({status:'invalid_id',events:[]},{status:400});
 const apiKey=process.env.API_FOOTBALL_KEY;
 if(!apiKey)return NextResponse.json({status:'not_configured',events:[]});
 try{
  const response=await fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${id}`,{headers:{'x-apisports-key':apiKey,accept:'application/json'},next:{revalidate:20}});
  if(!response.ok){const detail=await response.text().catch(()=> '');logApiFootballFailure('fixtures/events',response.status,detail);return NextResponse.json({status:response.status===429?'rate_limited':'provider_error',events:[]},{status:502});}
  const payload=await response.json() as {response?:EventRow[];errors?:Record<string,unknown>|string[]};
  if(payload.errors&&(Array.isArray(payload.errors)?payload.errors.length>0:Object.keys(payload.errors).length>0)){logApiFootballFailure('fixtures/events',response.status,payload.errors);return NextResponse.json({status:apiFootballFailureStatus(payload.errors),events:[]},{status:502});}
  const events=(Array.isArray(payload.response)?payload.response:[]).flatMap((event,index)=>{
   const elapsed=event.time?.elapsed;
   if(typeof elapsed!=='number')return[];
   return [{id:`${id}-${elapsed}-${index}`,minute:elapsed,extraMinute:event.time?.extra??null,team:event.team?.name??'',player:event.player?.name??'',assist:event.assist?.name??'',type:event.type??'',detail:event.detail??'',comments:event.comments??''}];
  });
  return NextResponse.json({status:'ok',events,updatedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=15, stale-while-revalidate=15'}});
 }catch{return NextResponse.json({status:'provider_error',events:[]},{status:502});}
}

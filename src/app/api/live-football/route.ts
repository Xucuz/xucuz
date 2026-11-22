import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
type RecordValue = Record<string, unknown>;
const object = (v:unknown):RecordValue => v !== null && typeof v === "object" && !Array.isArray(v) ? v as RecordValue : {};
const string = (v:unknown):string => typeof v === "string" ? v : "";
const numeric = (v:unknown):number|null => typeof v === "number" && Number.isFinite(v) ? v : null;
function istanbulDate() {
 const parts = new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const get=(type:string)=>parts.find(p=>p.type===type)?.value||"";
 return get("year")+"-"+get("month")+"-"+get("day");
}
export async function GET() {
 const key=process.env.API_FOOTBALL_KEY;
 if (!key) return NextResponse.json({error:"API-Football anahtarı tanımlanmamış.",matches:[]},{status:503});
 try {
  // One upstream request per 30-minute shared cache period; free tier has 100 requests/day.
  const date=istanbulDate();
  const response=await fetch("https://v3.football.api-sports.io/fixtures?date="+date+"&timezone=Europe%2FIstanbul",{
   headers:{"x-apisports-key":key,Accept:"application/json"},
   next:{revalidate:1800},signal:AbortSignal.timeout(12000)
  });
  if(!response.ok) throw new Error("Football API "+response.status);
  const payload=object(await response.json());
  const errors=payload.errors;
  if ((Array.isArray(errors)&&errors.length>0) || (errors&&typeof errors==="object"&&Object.keys(errors).length>0)) throw new Error("Provider error");
  if(!Array.isArray(payload.response)) throw new Error("Unexpected API response");
  const matches=payload.response.map((item:unknown)=>{
   const m=object(item),fixture=object(m.fixture),league=object(m.league),teams=object(m.teams),goals=object(m.goals),status=object(fixture.status);
   const code=string(status.short);
   const state=["1H","2H","HT","ET","BT","P","INT","LIVE"].includes(code)?"live":["FT","AET","PEN"].includes(code)?"finished":"scheduled";
   return {competition:string(league.name),slug:String(fixture.id??""),home:string(object(teams.home).name)||"Ev sahibi",away:string(object(teams.away).name)||"Deplasman",home_score:numeric(goals.home),away_score:numeric(goals.away),status:state,status_text:string(status.long)||(typeof status.elapsed==="number"?status.elapsed+"'":code),time:string(fixture.date)||null};
  });
  matches.sort((a,b)=>(a.status==="live"?-1:b.status==="live"?1:0)||(a.time||"").localeCompare(b.time||""));
  return NextResponse.json({matches,updated:new Date().toISOString(),provider:"API-Football",refreshSeconds:1800},{headers:{"Cache-Control":"public, s-maxage=1800, stale-while-revalidate=120"}});
 }catch{
  return NextResponse.json({error:"Gerçek futbol skorları şu anda alınamıyor.",matches:[]},{status:503});
 }
}

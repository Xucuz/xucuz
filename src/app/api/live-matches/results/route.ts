import {NextResponse} from 'next/server';

export const dynamic='force-dynamic';
type ApiFixture={fixture?:{id?:number;date?:string;status?:{short?:string}};league?:{name?:string;country?:string};teams?:{home?:{name?:string;logo?:string};away?:{name?:string;logo?:string}};goals?:{home?:number|null;away?:number|null}};
function failureStatus(errors:Record<string,unknown>|string[]){const message=JSON.stringify(errors).toLowerCase();if(/rate|limit|quota/.test(message))return'rate_limited';if(/subscription|not subscribed|plan|access/.test(message))return'subscription_required';return'provider_error';}

function turkeyDate(date=new Date()){
 return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
export async function GET(request:Request){
 const date=new URL(request.url).searchParams.get('date')??'';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({status:'invalid_date',matches:[]},{status:400});
 const parsed=new Date(`${date}T12:00:00Z`),today=new Date(`${turkeyDate()}T12:00:00Z`);
 if(Number.isNaN(parsed.getTime())||parsed>=today||today.getTime()-parsed.getTime()>180*86_400_000)return NextResponse.json({status:'date_out_of_range',matches:[]},{status:400});
 const apiKey=process.env.API_FOOTBALL_KEY;
 if(!apiKey)return NextResponse.json({status:'not_configured',matches:[]});
 try{
  const params=new URLSearchParams({date,timezone:'Europe/Istanbul'});
  const response=await fetch(`https://v3.football.api-sports.io/fixtures?${params}`,{headers:{'x-apisports-key':apiKey,accept:'application/json'},next:{revalidate:60}});
  if(!response.ok)return NextResponse.json({status:response.status===429?'rate_limited':'provider_error',matches:[]},{status:502});
  const payload=await response.json() as {response?:ApiFixture[];errors?:Record<string,unknown>|string[]};
  if(payload.errors&&(Array.isArray(payload.errors)?payload.errors.length>0:Object.keys(payload.errors).length>0))return NextResponse.json({status:failureStatus(payload.errors),matches:[]},{status:502});
  const finished=new Set(['FT','AET','PEN']);
  const matches=(Array.isArray(payload.response)?payload.response:[]).flatMap((item)=>{
   const id=item.fixture?.id,home=item.teams?.home?.name,away=item.teams?.away?.name,status=item.fixture?.status?.short;
   if(!id||!home||!away||!status||!finished.has(status))return[];
   return [{id,league:item.league?.name??'',country:item.league?.country??'',home,away,homeLogo:item.teams?.home?.logo??null,awayLogo:item.teams?.away?.logo??null,homeGoals:item.goals?.home??null,awayGoals:item.goals?.away??null,status,date:item.fixture?.date??null}];
  });
  return NextResponse.json({status:'ok',matches,updatedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=45, stale-while-revalidate=45'}});
 }catch{return NextResponse.json({status:'provider_error',matches:[]},{status:502});}
}

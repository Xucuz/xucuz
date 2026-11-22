import {NextResponse} from 'next/server';

export const dynamic='force-dynamic';

type ApiFixture={
 fixture?:{id?:number;date?:string;status?:{short?:string;elapsed?:number|null;extra?:number|null}};
 league?:{name?:string;country?:string;logo?:string};
 teams?:{home?:{name?:string;logo?:string};away?:{name?:string;logo?:string}};
 goals?:{home?:number|null;away?:number|null};
 score?:{halftime?:{home?:number|null;away?:number|null}};
};
function failureStatus(errors:Record<string,unknown>|string[]){const message=JSON.stringify(errors).toLowerCase();if(/rate|limit|quota/.test(message))return'rate_limited';if(/subscription|not subscribed|plan|access/.test(message))return'subscription_required';return'provider_error';}

export async function GET(){
 const apiKey=process.env.API_FOOTBALL_KEY;
 if(!apiKey)return NextResponse.json({status:'not_configured',matches:[]},{status:200,headers:{'Cache-Control':'no-store'}});
 try{
  const response=await fetch('https://v3.football.api-sports.io/fixtures?live=all',{
   headers:{'x-apisports-key':apiKey,accept:'application/json'},
   next:{revalidate:30}
  });
  if(!response.ok)return NextResponse.json({status:response.status===429?'rate_limited':'provider_error',matches:[]},{status:502,headers:{'Cache-Control':'no-store'}});
  const payload=await response.json() as {response?:ApiFixture[];errors?:Record<string,unknown>|string[]};
  if(payload.errors&&(Array.isArray(payload.errors)?payload.errors.length>0:Object.keys(payload.errors).length>0)){
   return NextResponse.json({status:failureStatus(payload.errors),matches:[]},{status:502,headers:{'Cache-Control':'no-store'}});
  }
  const matches=(Array.isArray(payload.response)?payload.response:[]).flatMap((item)=>{
   const id=item.fixture?.id,home=item.teams?.home?.name,away=item.teams?.away?.name;
   if(!id||!home||!away)return[];
   return [{
    id,league:item.league?.name??'',country:item.league?.country??'',
    home,away,homeLogo:item.teams?.home?.logo??null,awayLogo:item.teams?.away?.logo??null,
    homeGoals:item.goals?.home??null,awayGoals:item.goals?.away??null,
    minute:item.fixture?.status?.elapsed??null,extraMinute:item.fixture?.status?.extra??null,
    status:item.fixture?.status?.short??'',date:item.fixture?.date??null
   }];
  });
  return NextResponse.json({status:'ok',matches,updatedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=20, stale-while-revalidate=30'}});
 }catch{
  return NextResponse.json({status:'provider_error',matches:[]},{status:502,headers:{'Cache-Control':'no-store'}});
 }
}

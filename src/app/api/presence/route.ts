import {NextResponse} from 'next/server';
import {z} from 'zod';
import {metricsConfigured} from '@/lib/visitor-stats';
import {boundedBody,rateLimit,sameOrigin} from '@/lib/security';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const unavailable=()=>NextResponse.json({status:'unavailable'},{status:503,headers});

export async function GET(){
 if(!metricsConfigured())return unavailable();
 if(!rateLimit('presence-read',600))return NextResponse.json({status:'limited'},{status:429,headers});
 try{const {readOnlinePresence}=await import('@/lib/visitor-store');return NextResponse.json({status:'ready',...await readOnlinePresence()},{headers});}
 catch{return unavailable();}
}

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({status:'denied'},{status:403,headers});
 if(!metricsConfigured())return unavailable();
 if(!rateLimit('presence-write',300))return NextResponse.json({status:'limited'},{status:429,headers});
 let parsed;try{parsed=z.object({id:z.uuid()}).strict().safeParse(JSON.parse(await boundedBody(request,200)));}catch{return NextResponse.json({status:'invalid'},{status:400,headers});}
 if(!parsed.success)return NextResponse.json({status:'invalid'},{status:400,headers});
 try{const {heartbeatOnlinePresence}=await import('@/lib/visitor-store');return NextResponse.json({status:'ready',...await heartbeatOnlinePresence(parsed.data.id,process.env.VISITOR_METRICS_SECRET!)},{headers});}
 catch{return unavailable();}
}

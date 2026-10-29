import {NextResponse} from 'next/server';
import {z} from 'zod';
import {metricsConfigured} from '@/lib/visitor-stats';
import {sameOrigin,rateLimit,boundedBody} from '@/lib/security';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const unavailable=()=>NextResponse.json({status:'unavailable'},{status:503,headers});
export async function GET(){if(!metricsConfigured())return unavailable();if(!rateLimit('visitor-read',600))return NextResponse.json({status:'limited'},{status:429,headers});try{const {readVisitors}=await import('@/lib/visitor-store');return NextResponse.json({status:'ready',...await readVisitors()}, {headers});}catch{return unavailable();}}
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({status:'denied'},{status:403,headers});if(!metricsConfigured())return unavailable();if(!rateLimit('visitor-write',300))return NextResponse.json({status:'limited'},{status:429,headers});let parsed;try{parsed=z.object({id:z.uuid(),consent:z.literal(true)}).strict().safeParse(JSON.parse(await boundedBody(request,300)));}catch{return NextResponse.json({status:'invalid'},{status:400,headers});}if(!parsed.success)return NextResponse.json({status:'invalid'},{status:400,headers});try{const {recordVisitor,recordDailyVisitor}=await import('@/lib/visitor-store');const secret=process.env.VISITOR_METRICS_SECRET!;const yearly=await recordVisitor(parsed.data.id,secret);await recordDailyVisitor(parsed.data.id,secret);return NextResponse.json({status:'ready',...yearly},{headers});}catch{return unavailable();}}

import {NextResponse} from 'next/server';
import {isAdmin} from '@/lib/auth';
import {metricsConfigured} from '@/lib/visitor-stats';
import {rateLimit} from '@/lib/security';

export const dynamic='force-dynamic';
export async function GET(){
 if(!await isAdmin())return NextResponse.json({error:'Yetkisiz erişim.'},{status:401,headers:{'Cache-Control':'no-store'}});
 if(!metricsConfigured())return NextResponse.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});
 if(!rateLimit('admin-daily-visitors',120))return NextResponse.json({status:'limited'},{status:429,headers:{'Cache-Control':'no-store'}});
 try{const {readDailyVisitors}=await import('@/lib/visitor-store');return NextResponse.json({status:'ready',...await readDailyVisitors()},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
 catch{return NextResponse.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}

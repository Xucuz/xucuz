import {NextResponse} from 'next/server';
import {sameOrigin} from '@/lib/security';
export function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Geçersiz kaynak.'},{status:403});const response=NextResponse.json({ok:true});response.cookies.set('xucuz_session','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:0,path:'/'});return response;}

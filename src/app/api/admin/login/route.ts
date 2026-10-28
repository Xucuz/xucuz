import {NextResponse} from 'next/server';
import {z} from 'zod';
import {rateLimit,sameOrigin,sessionToken,verifyPassword} from '@/lib/security';
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Geçersiz kaynak.'},{status:403});
 if(!rateLimit('admin-login',5,300000))return NextResponse.json({error:'Çok fazla deneme. Beş dakika bekleyin.'},{status:429});
 if(!process.env.ADMIN_PASSWORD_HASH||!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)return NextResponse.json({error:'Yönetici kimlik doğrulaması yapılandırılmadı.'},{status:503});
 const body=await request.json().catch(()=>null);const result=z.object({password:z.string().min(1).max(200)}).safeParse(body);
 if(!result.success||!verifyPassword(result.data.password,process.env.ADMIN_PASSWORD_HASH))return NextResponse.json({error:'Giriş bilgileri geçersiz.'},{status:401});
 const response=NextResponse.json({ok:true});response.cookies.set('xucuz_session',sessionToken(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:8*3600});return response;
}

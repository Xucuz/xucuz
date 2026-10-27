import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isAdmin} from '@/lib/auth';
import {sameOrigin,rateLimit} from '@/lib/security';
import {clearCache} from '@/lib/providers/engine';
const schema=z.object({id:z.literal('authorized-feed'),name:z.string().min(1).max(100),enabled:z.boolean(),allowedHosts:z.array(z.string().regex(/^(?!localhost$)(?:[a-z0-9-]+\.)+[a-z]{2,}$/)).min(1).max(30),documentationUrl:z.url().startsWith('https://'),permissionReference:z.string().min(10).max(500),verified:z.literal(true)});
export async function POST(request:Request){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz erişim.'},{status:401});if(!sameOrigin(request)||!rateLimit('admin-write',30))return NextResponse.json({error:'İstek reddedildi.'},{status:403});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Alanları ve veri kullanım izni onayını kontrol edin.'},{status:400});try{const {db}=await import('@/db');const {providers}=await import('@/db/schema');const {verified,...values}=parsed.data;void verified;await db.insert(providers).values({...values,verifiedAt:new Date()}).onConflictDoUpdate({target:providers.id,set:{...values,verifiedAt:new Date()}});clearCache();return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Sağlayıcı kaydedilemedi.'},{status:503});}}

import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {isAdmin} from '@/lib/auth';
import {communityPriceEvidence} from '@/db/schema';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz erişim.'},{status:401});const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return new Response('Bulunamadı.',{status:404});try{const {db}=await import('@/db');const [file]=await db.select({mimeType:communityPriceEvidence.mimeType,content:communityPriceEvidence.content}).from(communityPriceEvidence).where(eq(communityPriceEvidence.id,id)).limit(1);if(!file)return new Response('Bulunamadı.',{status:404});const body=Uint8Array.from(file.content);return new Response(body,{headers:{'Content-Type':file.mimeType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});}catch{return new Response('Dosyaya erişilemiyor.',{status:503});}}

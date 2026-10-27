import {NextResponse} from 'next/server';
import {isAdmin} from '@/lib/auth';
import {sameOrigin,rateLimit} from '@/lib/security';
import {validateImport} from '@/lib/import';
import {clearCache} from '@/lib/providers/engine';
export async function POST(request:Request){
 if(!await isAdmin())return NextResponse.json({error:'Yetkisiz erişim.'},{status:401});if(!sameOrigin(request)||!rateLimit('admin-import',10))return NextResponse.json({error:'İstek reddedildi.'},{status:403});
 if(Number(request.headers.get('content-length'))>2000000)return NextResponse.json({error:'Dosya 2 MB sınırını aşıyor.'},{status:413});
 const body=await request.text();if(body.length>2000000)return NextResponse.json({error:'Dosya çok büyük.'},{status:413});
 try{const {db}=await import('@/db');const t=await import('@/db/schema');const {eq}=await import('drizzle-orm');const [provider]=await db.select().from(t.providers).where(eq(t.providers.id,'authorized-feed'));if(!provider?.verifiedAt)return NextResponse.json({error:'Önce izinli sağlayıcıyı doğrulayın.'},{status:400});
 const format=new URL(request.url).searchParams.get('format')==='csv'?'csv':'json';const report=validateImport(body,format,provider.allowedHosts);
 await db.transaction(async tx=>{const [run]=await tx.insert(t.importRuns).values({providerId:provider.id,status:report.errors.length?'rejected':'complete',rowCount:report.valid.length,report:{errors:report.errors}}).returning();
 for(const err of report.errors)await tx.insert(t.matchingIssues).values({importId:run.id,sourceId:`row-${err.row}`,reason:err.message});
 if(report.errors.length)return;
 for(const o of report.valid){const existing=await tx.select({providerId:t.offers.providerId}).from(t.offers).where(eq(t.offers.id,o.id));if(existing.length&&existing[0].providerId!==provider.id)throw new Error('id collision');await tx.insert(t.offers).values({id:o.id,category:o.category,providerId:o.providerId,entityId:o.entityId,variantKey:o.variantKey,currency:o.currency,price:o.price,updatedAt:new Date(o.updatedAt),payload:o}).onConflictDoUpdate({target:t.offers.id,set:{payload:o,price:o.price,updatedAt:new Date(o.updatedAt),entityId:o.entityId,variantKey:o.variantKey,currency:o.currency,category:o.category}});await tx.insert(t.priceObservations).values({offerId:o.id,amount:o.price,currency:o.currency,observedAt:new Date(o.updatedAt),demo:false});}
 await tx.update(t.providers).set({lastSyncAt:new Date(),lastError:null}).where(eq(t.providers.id,provider.id));});clearCache();return NextResponse.json({imported:report.errors.length?0:report.valid.length,errors:report.errors},{status:report.errors.length?422:200});
 }catch{return NextResponse.json({error:'İçe aktarma tamamlanamadı. Veritabanını ve kimlik çakışmalarını kontrol edin.'},{status:503});}
}

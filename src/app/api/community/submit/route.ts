import {createHash,randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {communityPriceInput,parseImageType} from '@/lib/community-prices';
import {normalize} from '@/lib/categories';
import {rateLimit,sameOrigin} from '@/lib/security';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const maxRequest=4_000_000,maxImage=1_300_000;
const header={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const kinds=['receipt','shelf','product'] as const;
const labels={receipt:'fiş',shelf:'raf etiketi',product:'ürün fotoğrafı'};
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'İstek kaynağı doğrulanamadı.'},{status:403,headers:header});
 const ip=(request.headers.get('x-real-ip')??request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown').slice(0,100);
 const bucket=createHash('sha256').update(`${process.env.SESSION_SECRET??'local-rate-limit'}:${ip}`).digest('hex').slice(0,24);
 if(!rateLimit(`community-submit:${bucket}`,5,60*60*1000))return NextResponse.json({error:'Saatlik gönderi sınırına ulaştın. Biraz sonra tekrar dene.'},{status:429,headers:header});
 const length=Number(request.headers.get('content-length')??0);if(length>maxRequest)return NextResponse.json({error:'Fotoğrafların toplam boyutu 4 MB sınırını aşıyor.'},{status:413,headers:header});
 try{
  const form=await request.formData();if(String(form.get('website')??'').trim())return NextResponse.json({ok:true,message:'Gönderin inceleme kuyruğuna alındı.'},{status:202,headers:header});
  const parsed=communityPriceInput.safeParse({productName:form.get('productName'),brand:form.get('brand')??'',variant:form.get('variant')??'',barcode:form.get('barcode')??'',store:form.get('store'),city:form.get('city'),district:form.get('district')??'',price:form.get('price'),packageValue:form.get('packageValue')||undefined,unit:form.get('unit')||undefined,packCount:form.get('packCount')||'1',campaign:form.get('campaign')??'',observedAt:form.get('observedAt')});
  if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??'Bilgileri kontrol edip yeniden dene.'},{status:400,headers:header});
  if(form.get('consent')!=='on')return NextResponse.json({error:'Topluluk kurallarını ve gönderinin incelemeye alınacağını kabul et.'},{status:400,headers:header});
  const input=parsed.data,observedAt=new Date(input.observedAt),now=new Date();if(Number.isNaN(observedAt.valueOf())||observedAt>now||observedAt<new Date(now.valueOf()-30*86400000))return NextResponse.json({error:'Gözlem tarihi bugün ile son 30 gün arasında olmalı.'},{status:400,headers:header});
  const uploads:{kind:(typeof kinds)[number];mimeType:'image/jpeg'|'image/png'|'image/webp';bytes:Buffer}[]=[];let totalBytes=0;
  for(const kind of kinds){const entry=form.get(kind);if(!(entry instanceof File)||entry.size===0)continue;if(entry.size>maxImage)return NextResponse.json({error:`Her fotoğraf en fazla 1,3 MB olabilir (${labels[kind]}).`},{status:413,headers:header});const bytes=Buffer.from(await entry.arrayBuffer()),mimeType=parseImageType(bytes);if(!mimeType||entry.type&&entry.type!==mimeType)return NextResponse.json({error:`${labels[kind]} JPEG, PNG veya WebP fotoğrafı olmalı.`},{status:415,headers:header});totalBytes+=bytes.length;uploads.push({kind,mimeType,bytes});}
  if(!uploads.length)return NextResponse.json({error:'En az bir fiş, raf etiketi veya ürün fotoğrafı ekle.'},{status:400,headers:header});if(totalBytes>maxRequest)return NextResponse.json({error:'Fotoğrafların toplam boyutu 4 MB sınırını aşıyor.'},{status:413,headers:header});
  const id=randomUUID();const normalizedProduct=normalize([input.productName,input.brand,input.variant].filter(Boolean).join(' '));
  const {db}=await import('@/db');const {communityPriceObservations,communityPriceEvidence}=await import('@/db/schema');
  await db.transaction(async tx=>{await tx.insert(communityPriceObservations).values({id,productName:input.productName,productKey:normalizedProduct,brand:input.brand||null,variant:input.variant||null,barcode:input.barcode||null,store:input.store,city:input.city,district:input.district||null,priceKurus:Math.round(input.price*100),currency:'TRY',packageValue:input.packageValue?String(input.packageValue):null,unit:input.unit??null,packCount:input.packCount,campaign:input.campaign||null,observedAt,expiresAt:new Date(observedAt.valueOf()+7*86400000),status:'pending'});if(uploads.length)await tx.insert(communityPriceEvidence).values(uploads.map(file=>({id:randomUUID(),observationId:id,kind:file.kind,mimeType:file.mimeType,byteLength:file.bytes.length,content:file.bytes})));});
  return NextResponse.json({ok:true,message:'Teşekkürler. Fiyat, fotoğrafla birlikte yönetici incelemesine gönderildi; onaylanana kadar karşılaştırmalarda gösterilmez.'},{status:202,headers:header});
 }catch{return NextResponse.json({error:'Gönderi kaydedilemedi. Bağlantıyı ve veritabanı durumunu kontrol edip tekrar dene.'},{status:503,headers:header});}
}

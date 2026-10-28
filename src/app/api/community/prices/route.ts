import {NextResponse} from 'next/server';
import {and,desc,eq,gte,ilike} from 'drizzle-orm';
import {communityPriceObservations} from '@/db/schema';
import {normalize} from '@/lib/categories';
import {unitPriceKurus} from '@/lib/community-prices';
import {rateLimit} from '@/lib/security';

export const dynamic='force-dynamic';
export async function GET(request:Request){
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 if(!rateLimit('community-price-search',120))return NextResponse.json({error:'Çok fazla arama. Biraz sonra yeniden dene.'},{status:429,headers});
 const params=new URL(request.url).searchParams,q=(params.get('q')??'').trim().slice(0,120),city=(params.get('city')??'').trim().slice(0,40);
 if(q.length<2)return NextResponse.json({observations:[],total:0,notice:'En az iki karakterlik ürün adı yaz.'},{headers});
 try{
  const {db}=await import('@/db');const now=new Date();const key=normalize(q);const rows=await db.select({id:communityPriceObservations.id,productName:communityPriceObservations.productName,brand:communityPriceObservations.brand,variant:communityPriceObservations.variant,store:communityPriceObservations.store,city:communityPriceObservations.city,district:communityPriceObservations.district,priceKurus:communityPriceObservations.priceKurus,packageValue:communityPriceObservations.packageValue,unit:communityPriceObservations.unit,packCount:communityPriceObservations.packCount,campaign:communityPriceObservations.campaign,observedAt:communityPriceObservations.observedAt,expiresAt:communityPriceObservations.expiresAt}).from(communityPriceObservations).where(and(eq(communityPriceObservations.status,'approved'),gte(communityPriceObservations.expiresAt,now),ilike(communityPriceObservations.productKey,`%${key.replace(/[\\%_]/g,'\\$&')}%`),...(city?[eq(communityPriceObservations.city,city)]:[]))).orderBy(desc(communityPriceObservations.observedAt)).limit(50);
  return NextResponse.json({observations:rows.map(row=>({id:row.id,productName:row.productName,brand:row.brand,variant:row.variant,store:row.store,city:row.city,district:row.district,price:row.priceKurus,currency:'TRY',unitPrice:unitPriceKurus(row.priceKurus,row.packageValue?Number(row.packageValue):undefined,row.unit??undefined,row.packCount),campaign:row.campaign,observedAt:row.observedAt.toISOString(),expiresAt:row.expiresAt.toISOString(),source:'Topluluk gönderisi · yönetici incelemesinden geçti',disclaimer:'Bu bir mağaza teklifi değildir. Fiyat bölgeye ve zamana göre değişebilir; satın almadan önce mağazada kontrol et.'})),total:rows.length,scope:'Yalnızca güncel, yönetici onaylı topluluk gözlemleri.'},{headers});
 }catch{return NextResponse.json({observations:[],total:0,error:'Fiyat kayıtlarına şu anda ulaşılamıyor. Daha sonra yeniden dene.'},{status:503,headers});}
}

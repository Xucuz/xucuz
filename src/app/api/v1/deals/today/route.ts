import {NextResponse} from 'next/server';
import {and,eq,gte,isNotNull,lte} from 'drizzle-orm';
import {rateLimit} from '@/lib/security';
import {categoryFor,freshness,type Category} from '@/lib/categories';
import {offerSchema} from '@/lib/types';
import {complete,total} from '@/lib/pricing';

export const dynamic='force-dynamic';

const aliases:Record<string,Category>={
 'otel & konaklama':'otel',otel:'otel','otel-konaklama':'otel',
 'uçak bileti':'ucak','ucak bileti':'ucak','uçak':'ucak','ucak':'ucak',
 'otobüs bileti':'otobus','otobus bileti':'otobus','otobüs':'otobus','otobus':'otobus',
 'beyaz eşya':'beyaz-esya','beyaz-esya':'beyaz-esya',çiçek:'cicek',cicek:'cicek',
};
function categorySlug(value:string):Category|undefined{
 const key=value.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
 return aliases[key]??categoryFor(key)?.slug;
}

export async function GET(request:Request){
 const headers={'Cache-Control':'public, s-maxage=60, stale-while-revalidate=60','X-Content-Type-Options':'nosniff'};
 if(!rateLimit('today-verified-deals',120))return NextResponse.json({error:'Çok fazla istek. Biraz sonra yeniden dene.'},{status:429,headers:{...headers,'Cache-Control':'no-store'}});

 const params=new URL(request.url).searchParams;
 const rawCategory=params.get('category');
 const limitRaw=params.get('limit');
 const includeShippingRaw=params.get('include_shipping');
 const limit=limitRaw===null?12:Number(limitRaw);
 if(!Number.isInteger(limit)||limit<1||limit>50)return NextResponse.json({error:'limit 1 ile 50 arasında bir tam sayı olmalı.'},{status:400,headers});
 if(includeShippingRaw!==null&&!['true','false'].includes(includeShippingRaw))return NextResponse.json({error:'include_shipping true veya false olmalı.'},{status:400,headers});
 const category=rawCategory?categorySlug(rawCategory):undefined;
 if(rawCategory&&!category)return NextResponse.json({error:'Bilinmeyen kategori.'},{status:400,headers});
 const includeShipping=includeShippingRaw!=='false';

 try{
  const [{db},{offers,providers}]=await Promise.all([import('@/db'),import('@/db/schema')]);
  const now=new Date();
  // The broadest supported freshness window is six hours (market data). Each
  // candidate is checked again against its own category's shorter freshness.
  const rows=await db.select({payload:offers.payload,providerName:providers.name,providerVerifiedAt:providers.verifiedAt})
   .from(offers).innerJoin(providers,eq(offers.providerId,providers.id))
   .where(and(eq(providers.enabled,true),isNotNull(providers.verifiedAt),...(category?[eq(offers.category,category)]:[]),gte(offers.updatedAt,new Date(now.getTime()-6*60*60*1000)),lte(offers.updatedAt,new Date(now.getTime()+60_000))))
   .orderBy(offers.updatedAt).limit(2000);

  const items=rows.flatMap(row=>{
   const parsed=offerSchema.safeParse(row.payload);
   if(!parsed.success||!row.providerVerifiedAt)return [];
   const offer=parsed.data;
   const maxAge=(freshness[offer.category]??0)*1000;
   const age=now.getTime()-Date.parse(offer.updatedAt);
   if(offer.demo||!offer.available||age<0||age>maxAge||offer.updatedAt!==row.payload.updatedAt)return [];
   // Never turn unknown delivery or mandatory fees into a free amount.
   if(includeShipping&&!complete(offer))return [];
   const totalPrice=includeShipping?total(offer):offer.price;
   return [{
    id:offer.id,title:offer.title,category:offer.category,source:offer.source,
    item_price:offer.price/100,
    shipping_cost:includeShipping&&offer.shipping!==null?offer.shipping/100:null,
    total_price:totalPrice/100,
    original_price:null,discount_percent:null,
    verified:true,in_stock:true,url:offer.url,
    updated_at:offer.updatedAt,
    currency:offer.currency,
    source_name:row.providerName,
   }];
  }).filter(item=>item.url!==null).sort((a,b)=>a.total_price-b.total_price);

  return NextResponse.json({date:now.toISOString().slice(0,10),category:category??null,verified_only:true,total_count:items.length,items:items.slice(0,limit),notice:'Yalnızca etkin, doğrulanmış sağlayıcılardan gelen güncel ve stokta görünen kayıtlar listelenir. İndirim karşılaştırma fiyatı veri modelinde bulunmadığından indirim oranı üretilmez.'},{headers});
 }catch{
  return NextResponse.json({error:'Doğrulanmış fiyat kayıtlarına şu anda ulaşılamıyor.'},{status:503,headers:{...headers,'Cache-Control':'no-store'}});
 }
}

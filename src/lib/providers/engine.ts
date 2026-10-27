import {categories,freshness,normalize,type Category} from '../categories';
import {demoOffers} from '../demo';
import {offerSchema,type Offer,type ProviderAdapter,type Search,type SearchResult} from '../types';
import {quote,total,matchKey} from '../pricing';
export function mode():'demo'|'live'{const value=process.env.DATA_MODE??'demo';if(value!=='demo'&&value!=='live')throw new Error('DATA_MODE must be demo or live');return value;}
const cache=new Map<string,{expires:number;offers:Offer[]}>();
export function clearCache(){cache.clear();}
export async function collect(adapters:ProviderAdapter[],category:Category,search:Search){
 const warnings:string[]=[];
 const settled=await Promise.allSettled(adapters.filter(a=>a.categories.includes(category)).map(async a=>{
 const key=JSON.stringify([a.id,category,search]);const hit=cache.get(key);if(hit&&hit.expires>Date.now())return hit.offers;
 let page=1;const offers:Offer[]=[];
 for(let n=0;n<10;n++){
 let result:Awaited<ReturnType<ProviderAdapter['search']>>|undefined;
 for(let attempt=0;attempt<2;attempt++) {const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 try {result=await Promise.race([a.search({category,search,page,signal:controller.signal}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('timeout'));},4000);})]);break;}catch{if(attempt===1)throw new Error('provider unavailable');}finally{clearTimeout(timer);controller.abort();}}
 if(!result)throw new Error('invalid result');
 for(const raw of result.offers){const o=offerSchema.parse(raw);if(o.category!==category||o.demo||o.providerId!==a.id)throw new Error('source mismatch');if(Date.parse(o.updatedAt)>Date.now()+60000)throw new Error('future observation');if(Date.now()-Date.parse(o.updatedAt)>freshness[category]*1000){warnings.push(`${a.id}: eski teklifler gösterilmedi.`);continue;}offers.push(o);}
 if(!result.nextPage)break;page=result.nextPage;if(n===9)warnings.push(`${a.id}: sonuç kapsamı ilk 10 sayfayla sınırlı.`);
 }
 if(cache.size>500)cache.clear();cache.set(key,{expires:Math.min(Date.now()+freshness[category]*1000,...offers.map(o=>Date.parse(o.updatedAt)+freshness[category]*1000)),offers});return offers;
 }));
 const offers:Offer[]=[];settled.forEach((r,i)=>{if(r.status==='fulfilled')offers.push(...r.value);else warnings.push(`${adapters.filter(a=>a.categories.includes(category))[i]?.id}: sağlayıcıya ulaşılamadı; karşılaştırma kapsamı eksik.`);});
 return {offers,warnings};
}
function includes(v:unknown,q:string){return !q||normalize(String(v??'')).includes(normalize(q));}
export function filterOffers(offers:Offer[],s:Search){return offers.filter(o=>{
 const a=o.attributes;const amount=total(o)/100;
 return o.available&&o.currency===s.currency&&amount>=s.min&&amount<=s.max&&includes([o.title,...Object.values(a)].join(' '),s.q)&&(!s.provider||o.providerId===s.provider)&&includes(a['Şehir'],s.city)&&includes(a['İlçe'],s.district)&&includes(a['Kalkış'],s.from)&&includes(a['Varış'],s.to)&&includes(a['Marka'],s.brand)&&includes(a['Model'],s.model)&&includes(a['Durum'],s.condition)&&includes(a['Yakıt'],s.fuel)&&includes(a['Vites'],s.gear)&&includes(a['Yıl'],s.year)&&(!s.km||Number(a['Kilometre'])<=Number(s.km))&&includes(a['Yıldız'],s.stars)&&includes(a['Yemek'],s.meal)&&includes(a['İptal'],s.cancel)&&includes(a['Aktarma'],s.stops)&&includes(a['Havayolu'],s.airline)&&includes(a['Saat'],s.time)&&(!s.duration||Number(a['Süre (dk)'])<=Number(s.duration))&&includes(a['Bagaj'],s.baggage)&&includes(Object.values(a).join(' '),s.feature);
 });}
export async function searchOffers(category:Category,s:Search,options?:{mode?:'demo'|'live';adapters?:ProviderAdapter[]}):Promise<SearchResult>{
 const current=options?.mode??mode();let offers:Offer[]=[];let warnings:string[]=[];
 if(current==='demo')offers=demoOffers.filter(o=>o.category===category).filter(o=>o.category!=='otel'||Number(o.attributes['Azami kişi'])>=Math.ceil((s.adults+s.children)/s.rooms)).map(o=>quote(o,s));
 else {const adapters=options?.adapters??(await import('./imported')).importedAdapters;const result=await collect(adapters,category,s);offers=result.offers.filter(o=>matchesScope(o,s));warnings=result.warnings;if(!adapters.length)warnings.push('Henüz doğrulanmış canlı sağlayıcı yapılandırılmadı.');}
 const providers=[...new Set(offers.map(o=>o.providerId))];
 offers=filterOffers(offers,s);
 // Exact variant only; different vehicles remain independent listings.
 offers=[...new Map(offers.map(o=>[`${matchKey(o)}:${o.providerId}`,o])).values()].sort((a,b)=>s.sort==='price-desc'?total(b)-total(a):total(a)-total(b));
 const count=offers.length;return {offers:offers.slice((s.page-1)*12,s.page*12),total:count,page:s.page,pages:Math.ceil(count/12),warnings:[...new Set(warnings)],mode:current,providers};
}
export const allCategories=categories.map(c=>c.slug);

// Live travel prices are already quoted totals; never multiply a live base fare.
export function matchesScope(o:Offer,s:Search){
 const a=o.attributes;
 if(o.category==='otel')return !!s.start&&!!s.end&&a['Giriş']===s.start&&a['Çıkış']===s.end&&Number(a['Oda'])===s.rooms&&Number(a['Yetişkin'])===s.adults&&Number(a['Çocuk'])===s.children&&String(a['Çocuk yaşları']??'')===s.ages;
 if(o.category==='ucak'||o.category==='otobus')return !!s.start&&a['Gidiş']===s.start&&Number(a['Yolcu'])===s.passengers&&(o.category!=='ucak'||(a['Kabin']===s.cabin&&a['Seyahat']===(s.trip==='return'?'Gidiş-dönüş':'Tek yön')&&(s.trip!=='return'||a['Dönüş']===s.end)));
 return true;
}

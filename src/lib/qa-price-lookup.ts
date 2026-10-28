import {and,desc,eq,gte,ilike} from 'drizzle-orm';
import {communityPriceObservations} from '@/db/schema';
import {normalize} from './categories';

type Language='tr'|'en'|'ru';
type PriceReply={text:string;href?:string;label?:string};

const ignored=new Set([
 'fiyat','fiyati','fiyatlar','fiyatlari','para','kac','ne','nedir','kadar','tutar','tl','try','en','ucuz','ucuzu','ucuzuna','uygun','magaza','magazasi','bugun','guncel','su','an','icin','istiyorum','var','mi','mu','nerede','bul','soyle','goster','lira','tane','adet','sadece','kampanya','indirim','teklif','birim','karsilastir','karsilastiririm','kiyasla','hesap','hesapla','hesaplarim','maliyet','gercek','toplam','rehber','ogren','ogrenmek','nasil','alirken',
 'price','prices','cost','much','how','cheapest','cheap','current','today','store','stores','offer','offers','show','find','what','is','the','of','for','try','does','this','it','my','me',
 'цена','цену','цены','сколько','стоит','дешевый','дешёвая','самый','актуальная','сегодня','магазин','предложение','найди','покажи','лира'
]);
const priceIntent=/fiyat|para|kac|ne kadar|tl|try|lira|ucuz|teklif|price|cost|how much|cheapest|offer|сколько|цен|стоит|дешев/i;
const locale={tr:'tr-TR',en:'en-GB',ru:'ru-RU'} as const;
const noMatch={tr:'Bu ürün için veritabanımızda güncel ve yönetici onaylı bir fiyat gözlemi bulamadım. Fiyat tahmini yapmıyorum.',en:'I could not find a current, moderator-approved price observation for this product in our database. I do not estimate prices.',ru:'В базе нет актуального подтверждённого модератором наблюдения цены для этого товара. Я не предполагаю цены.'} as const;
const dbUnavailable={tr:'Doğrulanmış fiyat kayıtlarına şu anda erişemiyorum; bu nedenle fiyat veremiyorum. Biraz sonra tekrar dene.',en:'Verified price records are unavailable right now, so I cannot provide a price. Please try again later.',ru:'Сейчас нет доступа к подтверждённым ценам, поэтому я не могу назвать цену. Попробуйте позже.'} as const;

/** Returns a price answer only from non-expired, moderator-approved database observations. */
export async function answerVerifiedPriceQuestion(question:string,language:Language='tr'):Promise<PriceReply|null>{
 if(!priceIntent.test(question)&&!priceIntent.test(normalize(question)))return null;
 const words=normalize(question).split(' ').filter(word=>word.length>1&&!ignored.has(word));
 if(!words.length)return null;
 try{
  const {db}=await import('@/db');
  const now=new Date();
  const matches=words.slice(0,5).map(word=>ilike(communityPriceObservations.productKey,`%${word.replace(/[\\%_]/g,'\\$&')}%`));
  const rows=await db.select({productName:communityPriceObservations.productName,brand:communityPriceObservations.brand,variant:communityPriceObservations.variant,store:communityPriceObservations.store,city:communityPriceObservations.city,district:communityPriceObservations.district,priceKurus:communityPriceObservations.priceKurus,observedAt:communityPriceObservations.observedAt,expiresAt:communityPriceObservations.expiresAt}).from(communityPriceObservations).where(and(eq(communityPriceObservations.status,'approved'),gte(communityPriceObservations.expiresAt,now),...matches)).orderBy(desc(communityPriceObservations.observedAt)).limit(5);
  if(!rows.length)return {text:noMatch[language],href:`/fiyatlar?q=${encodeURIComponent(words.join(' '))}`,label:language==='tr'?'Fiyat gözlemlerini ara':language==='en'?'Search price observations':'Искать наблюдения цен'};
  const money=new Intl.NumberFormat(locale[language],{style:'currency',currency:'TRY'});
  const entries=rows.map(row=>`${[row.brand,row.productName,row.variant].filter(Boolean).join(' · ')} — ${money.format(row.priceKurus/100)}, ${[row.district,row.city,row.store].filter(Boolean).join(', ')} (${row.observedAt.toLocaleDateString(locale[language])})`);
  const intro={tr:'Veritabanındaki güncel, yönetici onaylı fiyat gözlemleri:',en:'Current, moderator-approved price observations in our database:',ru:'Актуальные наблюдения цен из базы, проверенные модератором:'} as const;
  const caveat={tr:'Bunlar mağazanın canlı teklifi değildir; fiyat ve stok değişebilir.',en:'These are not live store offers; prices and stock may change.',ru:'Это не актуальные предложения магазина; цены и наличие могут измениться.'} as const;
  return {text:`${intro[language]} ${entries.join(' · ')} ${caveat[language]}`,href:`/fiyatlar?q=${encodeURIComponent(words.join(' '))}`,label:language==='tr'?'Gözlemleri aç':language==='en'?'Open observations':'Открыть наблюдения'};
 }catch{return {text:dbUnavailable[language],href:'/fiyatlar',label:language==='tr'?'Fiyat aramayı aç':language==='en'?'Open price search':'Открыть поиск цен'};}
}

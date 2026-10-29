import {and,desc,eq,gte,ilike,lte} from 'drizzle-orm';
import {communityPriceObservations} from '@/db/schema';
import {normalize} from './categories';
import {turkiyeCities} from './turkiye-cities';

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
const dbNotConfigured={tr:'Fiyat veritabanı Preview ortamında yapılandırılmamış (DATABASE_URL eksik). Bu nedenle doğrulanmış fiyat veremiyorum.',en:'The price database is not configured in the Preview environment (DATABASE_URL is missing), so I cannot provide a verified price.',ru:'База цен не настроена в Preview (отсутствует DATABASE_URL), поэтому я не могу сообщить подтверждённую цену.'} as const;
const dbConnectionFailed={tr:'Preview PostgreSQL veritabanına bağlanılamıyor. Doğrulanmış fiyat veremiyorum; bağlantı ayarları kontrol edilmeli.',en:'The Preview PostgreSQL database could not be reached. I cannot provide a verified price until its connection is fixed.',ru:'Не удалось подключиться к PostgreSQL в Preview. Нельзя сообщить подтверждённую цену, пока не исправлено подключение.'} as const;
const migrationMissing={tr:'Fiyat tabloları veritabanında bulunamadı. Preview veritabanında 0004 migration uygulanmalı.',en:'The price tables are missing. Apply migration 0004 to the Preview database.',ru:'Таблицы цен не найдены. Примените миграцию 0004 к базе Preview.'} as const;
const queryFailed={tr:'Doğrulanmış fiyat sorgusu tamamlanamadı. Kayıt varmış gibi fiyat göstermiyorum.',en:'The verified-price query could not be completed. I will not present a price as if a record existed.',ru:'Не удалось выполнить запрос подтверждённых цен. Я не буду показывать цену без записи.'} as const;

type FailureKind='database_not_configured'|'database_connection_failed'|'price_migration_missing'|'price_query_failed';
function failureKind(error:unknown):FailureKind{
 let current=error;
 for(let depth=0;depth<4&&current&&typeof current==='object';depth++){
  const value=current as {code?:unknown;errno?:unknown;message?:unknown;cause?:unknown};
  const code=String(value.code??value.errno??'');
  const message=typeof value.message==='string'?value.message:'';
  if(code==='42P01'||/community_price_(observations|evidence).*does not exist/i.test(message))return 'price_migration_missing';
  if(['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND','EHOSTUNREACH','ENETUNREACH','CONNECT_TIMEOUT','CONNECTION_CLOSED','CONNECTION_DESTROYED','CONNECTION_ENDED','28P01','3D000'].includes(code))return 'database_connection_failed';
  current=value.cause;
 }
 return 'price_query_failed';
}
function failureReply(kind:FailureKind,language:Language):PriceReply{
 const text=kind==='database_not_configured'?dbNotConfigured[language]:kind==='database_connection_failed'?dbConnectionFailed[language]:kind==='price_migration_missing'?migrationMissing[language]:queryFailed[language];
 console.error(`[xucina-qa] verified price lookup unavailable: ${kind}`);
 return {text,href:'/fiyatlar',label:language==='tr'?'Fiyat aramayı aç':language==='en'?'Open price search':'Открыть поиск цен'};
}

/** Returns a price answer only from non-expired, moderator-approved database observations. */
export async function answerVerifiedPriceQuestion(question:string,language:Language='tr'):Promise<PriceReply|null>{
 if(!priceIntent.test(question)&&!priceIntent.test(normalize(question)))return null;
 const normalized=normalize(question);
 const matchedCity=turkiyeCities.find(city=>normalized.includes(normalize(city)));
 const cityWords=new Set(matchedCity?normalize(matchedCity).split(' '):[]);
 const words=normalized.split(' ').filter(word=>word.length>1&&!ignored.has(word)&&!cityWords.has(word));
 if(!words.length)return null;
 if(!process.env.DATABASE_URL?.trim())return failureReply('database_not_configured',language);
 try{
  const {db}=await import('@/db');
  const now=new Date();
  const matches=words.slice(0,5).map(word=>ilike(communityPriceObservations.productKey,`%${word.replace(/[\\%_]/g,'\\$&')}%`));
  const rows=await db.select({productName:communityPriceObservations.productName,brand:communityPriceObservations.brand,variant:communityPriceObservations.variant,store:communityPriceObservations.store,city:communityPriceObservations.city,district:communityPriceObservations.district,priceKurus:communityPriceObservations.priceKurus,observedAt:communityPriceObservations.observedAt,expiresAt:communityPriceObservations.expiresAt}).from(communityPriceObservations).where(and(eq(communityPriceObservations.status,'approved'),gte(communityPriceObservations.expiresAt,now),lte(communityPriceObservations.observedAt,now),...(matchedCity?[eq(communityPriceObservations.city,matchedCity)]:[]),...matches)).orderBy(desc(communityPriceObservations.observedAt)).limit(5);
  if(!rows.length)return {text:noMatch[language],href:`/fiyatlar?q=${encodeURIComponent(words.join(' '))}`,label:language==='tr'?'Fiyat gözlemlerini ara':language==='en'?'Search price observations':'Искать наблюдения цен'};
  const money=new Intl.NumberFormat(locale[language],{style:'currency',currency:'TRY'});
  const entries=rows.map(row=>`${[row.brand,row.productName,row.variant].filter(Boolean).join(' · ')} — ${money.format(row.priceKurus/100)}, ${[row.district,row.city,row.store].filter(Boolean).join(', ')} (${row.observedAt.toLocaleDateString(locale[language])})`);
  const intro={tr:'Veritabanındaki güncel, yönetici onaylı fiyat gözlemleri:',en:'Current, moderator-approved price observations in our database:',ru:'Актуальные наблюдения цен из базы, проверенные модератором:'} as const;
  const caveat={tr:'Bunlar mağazanın canlı teklifi değildir; fiyat ve stok değişebilir.',en:'These are not live store offers; prices and stock may change.',ru:'Это не актуальные предложения магазина; цены и наличие могут измениться.'} as const;
  return {text:`${intro[language]} ${entries.join(' · ')} ${caveat[language]}`,href:`/fiyatlar?q=${encodeURIComponent(words.join(' '))}`,label:language==='tr'?'Gözlemleri aç':language==='en'?'Open observations':'Открыть наблюдения'};
 }catch(error){return failureReply(failureKind(error),language);}
}

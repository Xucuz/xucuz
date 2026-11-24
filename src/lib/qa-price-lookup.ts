import {and,desc,eq,gte,ilike,lte} from 'drizzle-orm';
import {communityPriceObservations} from '@/db/schema';
import {normalize} from './categories';
import {turkiyeCities} from './turkiye-cities';

type Language='tr'|'en'|'de'|'es'|'ru'|'fr'|'ar'|'zh';
type PriceReply={text:string;href?:string;label?:string};

const ignored=new Set([
 'fiyat','fiyati','fiyatlar','fiyatlari','para','kac','ne','nedir','kadar','tutar','tl','try','en','ucuz','ucuzu','ucuzuna','uygun','magaza','magazasi','bugun','guncel','su','an','icin','istiyorum','var','mi','mu','nerede','bul','soyle','goster','lira','tane','adet','sadece','kampanya','indirim','teklif','birim','karsilastir','karsilastiririm','kiyasla','hesap','hesapla','hesaplarim','maliyet','gercek','toplam','rehber','ogren','ogrenmek','nasil','alirken',
 'price','prices','cost','much','how','cheapest','cheap','current','today','store','stores','offer','offers','show','find','what','is','the','of','for','try','does','this','it','my','me',
 'цена','цену','цены','сколько','стоит','дешевый','дешёвая','самый','актуальная','сегодня','магазин','предложение','найди','покажи','лира',
 'preis','preise','kosten','günstig','guenstig','billig','angebot','angebote','suche','suche','precio','precios','barato','barata','oferta','ofertas','cuánto','cuanto','prix','coût','coute','moins','cher','chère','offre','offres','combien','سعر','الأسعار','رخيص','كم','价格','价钱','便宜','多少钱'
]);
const priceIntent=/fiyat|para|kac|ne kadar|tl|try|lira|ucuz|teklif|price|cost|how much|cheapest|offer|сколько|цен|стоит|дешев|preis|kosten|günstig|oferta|precio|barato|prix|coût|cher|سعر|أسعار|رخيص|价格|价钱|便宜/i;
const locale={tr:'tr-TR',en:'en-GB',de:'de-DE',es:'es-ES',ru:'ru-RU',fr:'fr-FR',ar:'ar-SA',zh:'zh-CN'} as const;
const noMatch={tr:'Bu ürün için veritabanımızda güncel ve yönetici onaylı bir fiyat gözlemi bulamadım. Fiyat tahmini yapmıyorum.',en:'I could not find a current, moderator-approved price observation for this product in our database. I do not estimate prices.',ru:'В базе нет актуального подтверждённого модератором наблюдения цены для этого товара. Я не предполагаю цены.',de:'In unserer Datenbank wurde kein aktueller, moderierter Preiseintrag für dieses Produkt gefunden. Ich schätze keine Preise.',es:'No encontré en la base una observación de precio actual y aprobada por moderación para este producto. No invento precios.',fr:'Aucune observation de prix récente et validée par un modérateur n’a été trouvée pour ce produit. Je n’estime pas les prix.',ar:'لم نعثر في قاعدة البيانات على ملاحظة سعر حديثة ومعتمدة من المشرفين لهذا المنتج. لا أخمّن الأسعار.',zh:'数据库中没有找到此商品近期且经管理员审核的价格记录。我不会估算价格。'} as const;
const dbNotConfigured={tr:'Fiyat veritabanı Preview ortamında yapılandırılmamış (DATABASE_URL eksik). Bu nedenle doğrulanmış fiyat veremiyorum.',en:'The price database is not configured in the Preview environment (DATABASE_URL is missing), so I cannot provide a verified price.',ru:'База цен не настроена в Preview (отсутствует DATABASE_URL), поэтому я не могу сообщить подтверждённую цену.',de:'Die Preis-Datenbank ist in der Preview-Umgebung nicht eingerichtet (DATABASE_URL fehlt). Daher kann ich keinen bestätigten Preis nennen.',es:'La base de precios no está configurada en Preview (falta DATABASE_URL); no puedo ofrecer un precio verificado.',fr:'La base de prix n’est pas configurée dans Preview (DATABASE_URL manquante) ; je ne peux pas fournir de prix vérifié.',ar:'قاعدة الأسعار غير مهيأة في بيئة Preview (متغير DATABASE_URL مفقود)، لذلك لا يمكنني تقديم سعر موثّق.',zh:'Preview 环境尚未配置价格数据库（缺少 DATABASE_URL），因此无法提供已验证的价格。'} as const;
const dbConnectionFailed={tr:'Preview PostgreSQL veritabanına bağlanılamıyor. Doğrulanmış fiyat veremiyorum; bağlantı ayarları kontrol edilmeli.',en:'The Preview PostgreSQL database could not be reached. I cannot provide a verified price until its connection is fixed.',ru:'Не удалось подключиться к PostgreSQL в Preview. Нельзя сообщить подтверждённую цену, пока не исправлено подключение.',de:'Die Preview-PostgreSQL-Datenbank ist nicht erreichbar. Bis die Verbindung funktioniert, kann ich keinen bestätigten Preis nennen.',es:'No se pudo conectar con PostgreSQL en Preview. No puedo dar un precio verificado hasta corregir la conexión.',fr:'La base PostgreSQL Preview est inaccessible. Je ne peux pas fournir de prix vérifié tant que la connexion n’est pas rétablie.',ar:'تعذّر الاتصال بقاعدة PostgreSQL في Preview. لا يمكن تقديم سعر موثّق قبل إصلاح الاتصال.',zh:'无法连接 Preview PostgreSQL 数据库。连接修复前不能提供已验证的价格。'} as const;
const migrationMissing={tr:'Fiyat tabloları veritabanında bulunamadı. Preview veritabanında 0004 migration uygulanmalı.',en:'The price tables are missing. Apply migration 0004 to the Preview database.',ru:'Таблицы цен не найдены. Примените миграцию 0004 к базе Preview.',de:'Die Preistabellen fehlen. Migration 0004 muss auf der Preview-Datenbank ausgeführt werden.',es:'Faltan las tablas de precios. Hay que aplicar la migración 0004 en la base de Preview.',fr:'Les tables de prix sont absentes. La migration 0004 doit être appliquée à la base Preview.',ar:'جداول الأسعار غير موجودة. يجب تطبيق الترحيل 0004 على قاعدة Preview.',zh:'未找到价格表。需要在 Preview 数据库中应用 0004 迁移。'} as const;
const queryFailed={tr:'Doğrulanmış fiyat sorgusu tamamlanamadı. Kayıt varmış gibi fiyat göstermiyorum.',en:'The verified-price query could not be completed. I will not present a price as if a record existed.',ru:'Не удалось выполнить запрос подтверждённых цен. Я не буду показывать цену без записи.',de:'Die Abfrage bestätigter Preise ist fehlgeschlagen. Ich zeige keinen Preis ohne passenden Datenbankeintrag.',es:'No se pudo completar la consulta de precios verificados. No mostraré un precio sin un registro.',fr:'La recherche de prix vérifiés a échoué. Je n’afficherai pas de prix sans enregistrement correspondant.',ar:'تعذّر إكمال استعلام الأسعار الموثّقة. لن أعرض سعرًا دون سجل مؤكد.',zh:'已验证价格查询未能完成。没有对应记录时，我不会显示价格。'} as const;

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
 console.error(`[xucin-qa] verified price lookup unavailable: ${kind}`);
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
  const intro:Record<Language,string>={tr:'Veritabanındaki güncel, yönetici onaylı fiyat gözlemleri:',en:'Current, moderator-approved price observations in our database:',ru:'Актуальные наблюдения цен из базы, проверенные модератором:',de:'Aktuelle, moderierte Preiseinträge aus unserer Datenbank:',es:'Observaciones de precios actuales y aprobadas por moderación:',fr:'Observations de prix actuelles validées par un modérateur :',ar:'ملاحظات الأسعار الحديثة والمعتمدة من المشرفين في قاعدة البيانات:',zh:'数据库中近期且经管理员审核的价格记录：'};
  const caveat:Record<Language,string>={tr:'Bunlar mağazanın canlı teklifi değildir; fiyat ve stok değişebilir.',en:'These are not live store offers; prices and stock may change.',ru:'Это не актуальные предложения магазина; цены и наличие могут измениться.',de:'Dies sind keine Live-Angebote; Preise und Verfügbarkeit können sich ändern.',es:'No son ofertas en tiempo real; los precios y la disponibilidad pueden cambiar.',fr:'Ce ne sont pas des offres en direct ; les prix et la disponibilité peuvent changer.',ar:'هذه ليست عروضًا مباشرة من المتاجر؛ قد تتغير الأسعار والتوافر.',zh:'这些不是商家的实时报价；价格和库存可能变化。'};
  const labels:Record<Language,string>={tr:'Gözlemleri aç',en:'Open observations',ru:'Открыть наблюдения',de:'Einträge öffnen',es:'Ver observaciones',fr:'Voir les observations',ar:'عرض الملاحظات',zh:'查看记录'};
  return {text:`${intro[language]} ${entries.join(' · ')} ${caveat[language]}`,href:`/fiyatlar?q=${encodeURIComponent(words.join(' '))}`,label:labels[language]};
 }catch(error){return failureReply(failureKind(error),language);}
}

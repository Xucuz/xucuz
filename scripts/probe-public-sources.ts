import {robotsAllowed} from '../src/lib/public-prices/robots';
import {writeFile,mkdir} from 'node:fs/promises';
// Candidates only. A successful home-page probe is not a working price integration.
const candidates=[
 ['elektronik','Inventus','https://www.inventus.com.tr'],
 ['elektronik','Sinerji','https://www.sinerji.gen.tr'],
 ['elektronik','Gaming.Gen.TR','https://www.gaming.gen.tr'],
 ['beyaz-esya','Arçelik','https://www.arcelik.com.tr'],
 ['beyaz-esya','Vestel','https://www.vestel.com.tr'],
 ['market','CarrefourSA','https://www.carrefoursa.com'],
 ['market','BİM','https://www.bim.com.tr'],
 ['market','A101','https://www.a101.com.tr'],
 ['market','Şok','https://www.sokmarket.com.tr'],
 ['cicek','Çiçek Filosu','https://www.cicekfilosu.com'],
 ['otomobil','Toyota Türkiye','https://www.toyota.com.tr'],
 ['otomobil','Škoda Türkiye','https://www.skoda.com.tr'],
 ['ucak','Türk Hava Yolları','https://www.turkishairlines.com'],
 ['ucak','Pegasus','https://www.flypgs.com'],
 ['otobus','Kamil Koç','https://www.kamilkoc.com.tr'],
 ['otobus','Pamukkale','https://www.pamukkale.com.tr'],
 ['otel','Jolly','https://www.jollytur.com'],
 ['otel','TatilBudur','https://www.tatilbudur.com']
] as const;
async function read(url:string){const r=await fetch(url,{headers:{'User-Agent':'XucuzPriceBot/1.0 (+https://xucuz.com/hakkimizda)'},redirect:'manual',signal:AbortSignal.timeout(8000)});if(r.status===404&&url.endsWith('/robots.txt'))return {status:404,body:''};if(!r.ok)return {status:r.status,body:''};if(!/text\/(plain|html)/i.test(r.headers.get('content-type')??''))return {status:r.status,body:''};const reader=r.body?.getReader();if(!reader)return {status:r.status,body:''};let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1_500_000){await reader.cancel();break;}chunks.push(value);}return {status:r.status,body:Buffer.concat(chunks).toString('utf8')};}
async function probe([category,name,origin]:typeof candidates[number]){const checkedAt=new Date().toISOString();try{const robots=await read(origin+'/robots.txt');if(![200,404].includes(robots.status))return {category,name,origin,checkedAt,status:'blocked',reason:`robots.txt HTTP ${robots.status}`};if(robots.status===200&&!/^\s*(?:#|user-agent|sitemap|allow|disallow)/i.test(robots.body))return {category,name,origin,checkedAt,status:'unverified',reason:'robots.txt doğrulanamadı'};const policy=robotsAllowed(robots.body,'/');if(!policy.allowed)return {category,name,origin,checkedAt,status:'blocked',reason:'robots.txt ana sayfa erişimini engelliyor'};if(policy.delaySeconds>5)return {category,name,origin,checkedAt,status:'deferred',reason:'Crawl-delay bu kısa inceleme bütçesini aşıyor'};if(policy.delaySeconds)await new Promise(r=>setTimeout(r,policy.delaySeconds*1000));const page=await read(origin+'/');if(page.status!==200)return {category,name,origin,checkedAt,status:'unavailable',reason:`Ana sayfa HTTP ${page.status}; tekrar deneme yapılmadı`};const protectedPage=/mwg-internal|<title[^>]*>[^<]*(?:captcha|access denied|just a moment|güvenlik kontrolü)/i.test(page.body);if(protectedPage)return {category,name,origin,checkedAt,status:'blocked',reason:'Koruma/ara sayfa döndü; aşılmadı'};return {category,name,origin,checkedAt,status:'candidate',hasStructuredProduct:/["']@type["']\s*:\s*["'](?:Product|Car|Hotel)["']/i.test(page.body),reason:'Ana sayfa okunabildi. Ürün/tarih/fiyat kapsamı henüz doğrulanmadı; canlı kaynak değildir.'};}catch{return {category,name,origin,checkedAt,status:'unavailable',reason:'Ağ/zaman aşımı; fiyat üretilmedi'};}}
async function main(){const results=[];for(let i=0;i<candidates.length;i+=3)results.push(...await Promise.all(candidates.slice(i,i+3).map(probe)));await mkdir('data',{recursive:true});const report={version:1,generatedAt:new Date().toISOString(),pricesPublished:false,results};await writeFile('data/source-probes.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
main().catch(()=>{console.error('Kaynak incelemesi tamamlanamadı.');process.exitCode=1;});

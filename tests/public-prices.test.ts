import {describe,it,expect} from 'vitest';
import {robotsAllowed} from '../src/lib/public-prices/robots';
import {parsePage,cents} from '../src/lib/public-prices/parse';
import {publicSources,canPublishSource} from '../src/lib/public-prices/catalog';
import {validateSnapshot} from '../src/lib/public-prices/read';
const source=publicSources.find(s=>s.id==='cicekmarket-public')!,page=source.pages[0];
const fixture=(price='123.45',availability='https://schema.org/InStock',visible='123,45')=>`<h1>21 Kırmızı Gül</h1><script type="application/ld+json">${JSON.stringify({'@type':'Product',name:"21 Kırmızı Gül",offers:{'@type':'Offer',price,priceCurrency:'TRY',availability}})}</script><div>${visible} TL</div>`;
describe('API kullanmadan fiyat okuma',()=>{
 it('yalnızca ürüne ait görünür ve yapılandırılmış fiyat eşleşirse kaydeder',()=>{const o=parsePage(fixture(),source,page,new Date().toISOString());expect(o.price).toBe(12345);expect(o.demo).toBe(false);expect(o.shipping).toBeNull();expect(o.mandatoryFees).toBeNull();expect(o.url).toBe(page.url);});
 it('küsuratı ayrı HTML elemanında olan gerçek görünür fiyatı okur',()=>{expect(parsePage(fixture('809.00',undefined,'809 <span>,00</span>'),source,page,new Date().toISOString()).price).toBe(80900);});
 it('stok yok, fiyat uyumsuz veya ürün değiştiyse fiyat üretmez',()=>{expect(()=>parsePage(fixture('123.45','https://schema.org/OutOfStock'),source,page,new Date().toISOString())).toThrow();expect(()=>parsePage(fixture('123.45',undefined,'999,00'),source,page,new Date().toISOString())).toThrow();expect(()=>parsePage(fixture().replaceAll('21 Kırmızı','Different'),source,page,new Date().toISOString())).toThrow();});
 it('AggregateOffer düşük fiyatını kesin teklif diye almaz',()=>{expect(()=>parsePage(fixture().replaceAll('"Offer"','"AggregateOffer"'),source,page,new Date().toISOString())).toThrow();});
 it('belirsiz para gösterimlerini kabul etmez',()=>{expect(cents('1234.50')).toBe(123450);for(const s of ['1.234,50','1234,50','0','NaN','-2'])expect(()=>cents(s)).toThrow();});
 it('eski, demo ve katalog dışında URL içeren snapshot kayıtlarını göstermez',()=>{const o=parsePage(fixture(),source,page,new Date().toISOString());const snapshot={version:1,generatedAt:new Date().toISOString(),statuses:[],offers:[o,{...o,id:'unknown'},{...o,demo:true},{...o,url:'https://evil.example/'},{...o,updatedAt:'2020-01-01T00:00:00.000Z'}]};expect(validateSnapshot(snapshot).offers).toHaveLength(0);const previous=source.publicationReview;try{source.publicationReview={status:'approved',checkedAt:'2026-10-27',reason:'Test fixture only'};expect(validateSnapshot(snapshot).offers).toHaveLength(1);}finally{source.publicationReview=previous;}});
});
describe('robots erişim kuralları',()=>{
 it('yasak yolları engeller, uzun eşleşme ve allow önceliğini uygular',()=>{const rules='User-agent: *\nDisallow: /private\nAllow: /private/open$\nDisallow: /*?q=';expect(robotsAllowed(rules,'/private/x').allowed).toBe(false);expect(robotsAllowed(rules,'/private/open').allowed).toBe(true);expect(robotsAllowed(rules,'/private/open/more').allowed).toBe(false);expect(robotsAllowed(rules,'/search?q=a').allowed).toBe(false);});
 it('özel bot grubunu ve crawl-delay değerini korur',()=>{const rules='User-agent: *\nAllow: /\nUser-agent: XucuzPriceBot\nDisallow: /\nCrawl-delay: 7';expect(robotsAllowed(rules,'/')).toEqual({allowed:false,delaySeconds:7});});
});

describe('satıcıdan veri beklemeyen kaynak incelemesi',()=>{
 it('erişilebilir aday raporunu fiyat entegrasyonu veya fiyat yayını saymaz',async()=>{const {discoverySchema}=await import('../src/lib/public-prices/discovery');const report={version:1,generatedAt:new Date().toISOString(),pricesPublished:false,results:[{category:'market',name:'Aday mağaza',origin:'https://example.com',checkedAt:new Date().toISOString(),status:'candidate',reason:'Ürün ve fiyat doğrulanmadı.'}]};expect(discoverySchema.parse(report).results[0].status).toBe('candidate');expect(discoverySchema.safeParse({...report,pricesPublished:true}).success).toBe(false);});
});

describe('kaynak yayın incelemesi',()=>{it('erişilebilir ama incelenmemiş veya kısıtlı kaynakları yayımlamaz',()=>{expect(canPublishSource(source)).toBe(false);expect(canPublishSource({...source,publicationReview:{status:'restricted',checkedAt:'2026-10-27',reason:'Kısıtlı'}})).toBe(false);expect(canPublishSource({...source,publicationReview:{status:'approved',checkedAt:'2026-10-27',reason:'Test'}})).toBe(true);expect(canPublishSource({...source,enabled:false,publicationReview:{status:'approved',checkedAt:'2026-10-27',reason:'Test'}})).toBe(false);});});

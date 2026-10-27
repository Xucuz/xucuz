import {describe,it,expect,beforeEach} from 'vitest';
import {categoryFor,normalize} from '../src/lib/categories';
import {demoOffers} from '../src/lib/demo';
import {complete,matchKey,nights,quote,total,unitPrice} from '../src/lib/pricing';
import {searchSchema,type ProviderAdapter} from '../src/lib/types';
import {clearCache,collect,filterOffers,searchOffers} from '../src/lib/providers/engine';
import {hashPassword,verifyPassword,sessionToken,validSession,safeProviderUrl,rateLimit} from '../src/lib/security';
import {validateImport} from '../src/lib/import';
const search=(v={})=>searchSchema.parse(v);
const first=demoOffers[0];
describe('Türkçe arama ve kategoriler',()=>{
 it('hotel ve Türkçe eş anlamlıları eşler',()=>{for(const s of ['HOTEL','Otel','hotel','Konaklama'])expect(categoryFor(s)?.slug).toBe('otel');expect(categoryFor('UÇAK BİLETİ')?.slug).toBe('ucak');expect(normalize('İSTANBUL IĞDIR')).toBe('istanbul igdir');});
 it('tüm kategorilerde arar ve filtreler',async()=>{for(const c of ['otel','ucak','otobus','market','otomobil','elektronik','beyaz-esya'] as const){const r=await searchOffers(c,search(),{mode:'demo'});expect(r.total).toBeGreaterThan(0);expect(r.offers.every(o=>o.demo&&o.category===c)).toBe(true);expect(filterOffers(r.offers,search({provider:'ornek-a'})).every(o=>o.providerId==='ornek-a')).toBe(true);}});
 it('kategoriye uygun alanlara göre daraltır',async()=>{expect((await searchOffers('otel',search({stars:'5',city:'istanbul'}),{mode:'demo'})).total).toBe(2);expect((await searchOffers('ucak',search({from:'istanbul',to:'antalya',baggage:'15 kg',stops:'0'}),{mode:'demo'})).total).toBe(2);expect((await searchOffers('otobus',search({from:'ankara'}),{mode:'demo'})).total).toBe(2);expect((await searchOffers('market',search({q:'500 ml',district:'kadikoy'}),{mode:'demo'})).total).toBe(2);expect((await searchOffers('otomobil',search({fuel:'Elektrik',condition:'Sıfır'}),{mode:'demo'})).total).toBe(1);expect((await searchOffers('elektronik',search({feature:'256 GB'}),{mode:'demo'})).total).toBe(2);expect((await searchOffers('beyaz-esya',search({feature:'İnoks'}),{mode:'demo'})).total).toBe(2);});
 it('geçersiz tarih, limit ve çocuk yaşlarını reddeder',()=>{expect(searchSchema.safeParse({start:'2026-10-30',end:'2026-10-29'}).success).toBe(false);expect(searchSchema.safeParse({min:10,max:5}).success).toBe(false);expect(searchSchema.safeParse({children:2,ages:'5'}).success).toBe(false);});
});
describe('fiyat ve eşleştirme',()=>{
 it('gece ve oda toplamını hesaplar',()=>{const s=search({start:'2026-11-01',end:'2026-11-04',rooms:2});expect(nights(s.start,s.end)).toBe(3);expect(quote(first,s).price).toBe(first.price*6);});
 it('tüm yolcuların zorunlu ücretini dahil eder',()=>{const o=demoOffers.find(o=>o.id==='ucak-1')!;expect(total(quote(o,search({passengers:3})))).toBe((o.price+20000)*3);expect(total(quote(o,search({passengers:2,trip:'return'})))).toBe((o.price+20000)*4);});
 it('bilinmeyen ücretleri toplam tamamlanmış saymaz',()=>{const o=demoOffers.find(o=>o.id==='market-1')!;expect(complete(o)).toBe(false);});
 it('litre, kg ve paket dönüşümleri tutarlıdır',()=>{expect(unitPrice(demoOffers.find(o=>o.id==='market-2')!)?.price).toBe(5380);expect(unitPrice(demoOffers.find(o=>o.id==='market-3')!)?.price).toBe(7995);});
 it('farklı gramaj, kapasite, kondisyon ve donanımları birleştirmez',()=>{for(const prefix of ['market','el','be','oto']){const a=demoOffers.find(o=>o.id===`${prefix}-1`)!;const b=demoOffers.find(o=>o.id===`${prefix}-2`)!;expect(matchKey(a)).not.toBe(matchKey(b));}expect(matchKey(first)).toBe(matchKey(demoOffers[1]));});
 it('para birimleri arasında sıralama yapmaz',()=>{expect(filterOffers([{...first,currency:'USD'}],search())).toHaveLength(0);});
});
describe('sağlayıcı motoru',()=>{
 beforeEach(()=>clearCache());
 it('canlı mod demo verisine dönmez',async()=>{const r=await searchOffers('otel',search(),{mode:'live',adapters:[]});expect(r.offers).toEqual([]);expect(r.warnings.length).toBeGreaterThan(0);});
 it('hatalı sağlayıcı diğerlerini düşürmez',async()=>{const ok:ProviderAdapter={id:'ok',categories:['otel'],search:async()=>({offers:[{...first,id:'live',demo:false,providerId:'ok',updatedAt:new Date().toISOString()}]})};const fail:ProviderAdapter={id:'fail',categories:['otel'],search:async()=>{throw new Error('secret');}};const r=await collect([ok,fail],'otel',search());expect(r.offers).toHaveLength(1);expect(r.warnings.join()).toContain('kapsamı eksik');expect(r.warnings.join()).not.toContain('secret');});
 it('eski ve demo canlı tekliflerini kabul etmez',async()=>{const adapter:ProviderAdapter={id:'ornek-a',categories:['otel'],search:async()=>({offers:[{...first,demo:false}]})};expect((await collect([adapter],'otel',search())).offers).toHaveLength(0);});
 it('sayfalama ve önbelleği yönetir',async()=>{let calls=0;const a:ProviderAdapter={id:'ok',categories:['otel'],search:async({page})=>{calls++;return {offers:[{...first,id:`live-${page}`,providerId:'ok',demo:false,updatedAt:new Date().toISOString()}],nextPage:page===1?2:undefined};}};expect((await collect([a],'otel',search())).offers).toHaveLength(2);await collect([a],'otel',search());expect(calls).toBe(2);});
});
describe('güvenlik ve aktarım',()=>{
 it('HTTPS ve tam izinli alan adı gerektirir',()=>{expect(safeProviderUrl('https://shop.example.com/p',['shop.example.com'])).toBeTruthy();for(const u of ['http://shop.example.com','https://shop.example.com.evil.test','https://127.0.0.1','https://user:pass@shop.example.com','https://shop.example.com:8080'])expect(safeProviderUrl(u,['shop.example.com'])).toBeNull();});
 it('parola ve imzalı süreli oturum doğrular',()=>{process.env.SESSION_SECRET='a'.repeat(40);const hash=hashPassword('long-unique-password');expect(verifyPassword('long-unique-password',hash)).toBe(true);expect(verifyPassword('wrong',hash)).toBe(false);const token=sessionToken(100);expect(validSession(token,101)).toBe(true);expect(validSession(token+'0',101)).toBe(false);expect(validSession(token,9*3600000)).toBe(false);});
 it('istekleri sınırlar',()=>{expect(rateLimit('test',1)).toBe(true);expect(rateLimit('test',1)).toBe(false);});
 it('içe aktarma demo, dış URL ve mükerrer kimliği reddeder',()=>{expect(validateImport(JSON.stringify([first]),'json',[]).errors.length).toBe(1);const valid={...first,demo:false,providerId:'authorized-feed',url:'https://shop.example.com/item',updatedAt:new Date().toISOString()};expect(validateImport(JSON.stringify([valid]),'json',['shop.example.com']).valid).toHaveLength(1);expect(validateImport(JSON.stringify([valid,valid]),'json',['shop.example.com']).errors).toHaveLength(1);});
});

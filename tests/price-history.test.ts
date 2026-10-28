import {describe,it,expect} from 'vitest';
import {historyPeriod,turkeyDay,isCalendarDay,mergeObservations,historicalMinimum,observeOffers,observationSchema,type Observation} from '../src/lib/price-history/core';
import {priceModels,modelSignature} from '../src/lib/price-history/models';
import {publicSources} from '../src/lib/public-prices/catalog';
import type {Offer} from '../src/lib/types';
const now='2026-10-27T12:00:00.000Z';
const record=(changes:Partial<Observation>={}):Observation=>({modelId:priceModels[0].id,variantSignature:modelSignature(priceModels[0]),offerId:'fixture',sourceId:'fixture-source',sourceUrl:'https://fixture.example/product',price:10000,shipping:null,mandatoryFees:null,currency:'TRY',observedAt:'2026-09-27T10:00:00.000Z',recordedAt:now,...changes});
describe('geçmiş fiyat dönemleri',()=>{
 it('bir ay önceki günü son 30 günden ayrı hesaplar',()=>{expect(historyPeriod('2026-10-27','month-ago-day')).toEqual({start:'2026-09-27',end:'2026-09-27'});expect(historyPeriod('2026-10-27','last30')).toEqual({start:'2026-09-28',end:'2026-10-27'});});
 it('ay sonu, artık yıl ve yıl geçişinde takvimi korur',()=>{expect(historyPeriod('2026-03-31','month-ago-day').start).toBe('2026-02-28');expect(historyPeriod('2024-03-31','month-ago-day').start).toBe('2024-02-29');expect(historyPeriod('2026-01-31','month-ago-day').start).toBe('2025-12-31');});
 it('Türkiye günü ve takvim doğrulaması uygular',()=>{expect(turkeyDay('2026-10-26T21:01:00.000Z')).toBe('2026-10-27');expect(isCalendarDay('2026-02-30')).toBe(false);expect(isCalendarDay('2026-10-27')).toBe(true);expect(()=>historyPeriod('not-a-date','last30')).toThrow();});
});
describe('gerçek gözlem kaydının korunması',()=>{
 it('günlük minimumu korur ve sonraki yüksek fiyatla tarihi yenilemez',()=>{const first=record({observedAt:'2026-10-27T07:00:00.000Z'});const high=record({price:12000,observedAt:'2026-10-27T11:00:00.000Z'});const merged=mergeObservations([first],[high],now);expect(merged).toHaveLength(1);expect(merged[0].observedAt).toBe(first.observedAt);expect(merged[0].price).toBe(10000);});
 it('düşük fiyat geldiğinde o gözlemin özgün zamanını tutar',()=>{const lower=record({price:9000,observedAt:'2026-09-27T11:00:00.000Z'});expect(mergeObservations([record()],[lower],now)[0]).toEqual(lower);});
 it('kaynak, gün ve para birimini tekilleştirmede karıştırmaz',()=>{expect(mergeObservations([record()],[record(),record({currency:'EUR'}),record({sourceId:'second'}),record({observedAt:'2026-09-28T10:00:00.000Z'})],now)).toHaveLength(4);});
 it('gelecekte kaydedilmiş ve saklama süresi bitmiş kayıtları almaz',()=>{expect(mergeObservations([record({recordedAt:'2027-01-01T00:00:00.000Z'}),record({observedAt:'2020-01-01T00:00:00.000Z'})],[],now)).toHaveLength(0);expect(observationSchema.safeParse(record({observedAt:'2027-01-01T00:00:00.000Z'})).success).toBe(false);});
});
describe('kamusal geçmiş fiyat özeti',()=>{
 it('aynı model, dönem ve para birimi içinde minimumu bulur',()=>{const summary=historicalMinimum([record(),record({price:9000}),record({price:1,currency:'USD'}),record({price:2,modelId:'another-model'}),record({price:4,variantSignature:'another-variant'}),record({price:3,observedAt:'2026-09-26T10:00:00.000Z'})],priceModels[0].id,'TRY',historyPeriod('2026-10-27','month-ago-day'));expect(summary.price).toBe(9000);expect(summary.hasUnknownFees).toBe(true);expect(summary.dayCount).toBe(1);expect(summary.observationCount).toBe(2);expect(JSON.stringify(summary)).not.toContain('fixture');for(const field of ['sourceId','sourceUrl','offerId','recordedAt'])expect(summary).not.toHaveProperty(field);});
 it('kayıt yoksa geçmiş fiyat tahmin etmez',()=>{expect(historicalMinimum([],priceModels[0].id,'TRY',historyPeriod('2026-10-27','last30')).price).toBeNull();});
});
describe('yalnızca onaylı ve tam eşleşen teklifler kaydedilir',()=>{
 const source=publicSources.find(s=>s.id==='gaming-public')!;
 const fixture=():Offer=>({id:source.pages[0].id,providerId:source.id,provider:source.name,category:'elektronik',entityId:'fixture',variantKey:'fixture',title:'Test fixture',description:'Test only',price:10000,shipping:null,mandatoryFees:null,currency:'TRY',available:true,url:source.pages[0].url,source:'Test only',updatedAt:now,demo:false,sponsored:false,affiliate:false,attributes:{...priceModels[0].requiredAttributes}});
 it('kısıtlı kaynağı, demo ve belirsiz model koşullarını reddeder',()=>{expect(observeOffers([fixture()],now)).toEqual([]);const previous=source.publicationReview;try{source.publicationReview={status:'approved',checkedAt:'2026-10-27',reason:'Test fixture only'};expect(observeOffers([fixture()],now)).toHaveLength(1);for(const change of [{demo:true},{available:false},{updatedAt:'2026-09-27T00:00:00.000Z'},{url:'https://elsewhere.example/'},{attributes:{...fixture().attributes,'Garanti':'2 yıl'}},{attributes:{...fixture().attributes,'Kapasite':'2 TB'}}])expect(observeOffers([{...fixture(),...change}],now)).toHaveLength(0);}finally{source.publicationReview=previous;}});
});

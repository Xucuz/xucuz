import {afterEach,describe,expect,it,vi} from 'vitest';

const mock=vi.hoisted(()=>{
 const rows:{productName:string;brand:string|null;variant:string|null;store:string;city:string;district:string|null;priceKurus:number;observedAt:Date;expiresAt:Date}[]=[];
 const query={from:vi.fn(()=>query),where:vi.fn(()=>query),orderBy:vi.fn(()=>query),limit:vi.fn(async()=>rows)};
 return {rows,query,db:{select:vi.fn(()=>query)}};
});
vi.mock('@/db',()=>({db:mock.db}));

import {answerVerifiedPriceQuestion} from '../src/lib/qa-price-lookup';

describe('Xucina verified price answers',()=>{
 afterEach(()=>{mock.rows.length=0;mock.query.limit.mockImplementation(async()=>mock.rows);vi.unstubAllEnvs();vi.clearAllMocks();});
 it('uses only a returned approved observation and names its source and observation date',async()=>{
  vi.stubEnv('DATABASE_URL','postgres://test-only.invalid/xucuz');
  mock.rows.push({productName:'Akustik gitar',brand:'Örnek Marka',variant:'41 inç',store:'Örnek Mağaza',city:'Ankara',district:'Çankaya',priceKurus:125000,observedAt:new Date('2026-10-27T12:00:00Z'),expiresAt:new Date('2026-11-10T12:00:00Z')});
  const reply=await answerVerifiedPriceQuestion('Akustik gitar fiyatı ne kadar?','tr');
  expect(mock.query.where).toHaveBeenCalledOnce();expect(mock.query.orderBy).toHaveBeenCalledOnce();expect(reply?.text).toContain('₺1.250,00');expect(reply?.text).toContain('Örnek Mağaza');expect(reply?.text).toContain('27.10.2026');expect(reply?.text).toContain('mağazanın canlı teklifi değildir');
 });
 it('returns null for a non-price guide question so the guide assistant answers it',async()=>{
  expect(await answerVerifiedPriceQuestion('Birim fiyatı nasıl karşılaştırırım?','tr')).toBeNull();expect(mock.db.select).not.toHaveBeenCalled();
 });
 it('reports missing Preview database configuration separately from an empty result',async()=>{
  vi.stubEnv('DATABASE_URL','');const reply=await answerVerifiedPriceQuestion('Gitar fiyatı ne kadar?','tr');
  expect(reply?.text).toContain('DATABASE_URL eksik');expect(mock.db.select).not.toHaveBeenCalled();
 });
 it('distinguishes a connected database with no approved current prices',async()=>{
  vi.stubEnv('DATABASE_URL','postgres://test-only.invalid/xucuz');const reply=await answerVerifiedPriceQuestion('Gitar fiyatı ne kadar?','tr');
  expect(mock.db.select).toHaveBeenCalledOnce();expect(reply?.text).toContain('güncel ve yönetici onaylı bir fiyat gözlemi bulamadım');
 });
 it('reports connection and missing-migration errors separately without exposing driver details',async()=>{
  vi.stubEnv('DATABASE_URL','postgres://test-only.invalid/xucuz');
  mock.query.limit.mockRejectedValueOnce(Object.assign(new Error('private host details'),{code:'ECONNREFUSED'}));
  const connection=await answerVerifiedPriceQuestion('Gitar fiyatı ne kadar?','tr');expect(connection?.text).toContain('PostgreSQL veritabanına bağlanılamıyor');expect(connection?.text).not.toContain('private host details');
  mock.query.limit.mockRejectedValueOnce(Object.assign(new Error('missing table'),{code:'42P01'}));
  const migration=await answerVerifiedPriceQuestion('Gitar fiyatı ne kadar?','tr');expect(migration?.text).toContain('0004 migration uygulanmalı');
 });
});

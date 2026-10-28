import {afterEach,describe,expect,it,vi} from 'vitest';

const mock=vi.hoisted(()=>{
 const rows:{productName:string;brand:string|null;variant:string|null;store:string;city:string;district:string|null;priceKurus:number;observedAt:Date;expiresAt:Date}[]=[];
 const query={from:vi.fn(()=>query),where:vi.fn(()=>query),orderBy:vi.fn(()=>query),limit:vi.fn(async()=>rows)};
 return {rows,query,db:{select:vi.fn(()=>query)}};
});
vi.mock('@/db',()=>({db:mock.db}));

import {answerVerifiedPriceQuestion} from '../src/lib/qa-price-lookup';

describe('Xucina verified price answers',()=>{
 afterEach(()=>{mock.rows.length=0;vi.clearAllMocks();});
 it('uses only a returned approved observation and names its source and observation date',async()=>{
  mock.rows.push({productName:'Akustik gitar',brand:'Örnek Marka',variant:'41 inç',store:'Örnek Mağaza',city:'Ankara',district:'Çankaya',priceKurus:125000,observedAt:new Date('2026-10-27T12:00:00Z'),expiresAt:new Date('2026-11-10T12:00:00Z')});
  const reply=await answerVerifiedPriceQuestion('Akustik gitar fiyatı ne kadar?','tr');
  expect(mock.query.where).toHaveBeenCalledOnce();expect(mock.query.orderBy).toHaveBeenCalledOnce();expect(reply?.text).toContain('₺1.250,00');expect(reply?.text).toContain('Örnek Mağaza');expect(reply?.text).toContain('27.10.2026');expect(reply?.text).toContain('mağazanın canlı teklifi değildir');
 });
 it('returns null for a non-price guide question so the guide assistant answers it',async()=>{
  expect(await answerVerifiedPriceQuestion('Birim fiyatı nasıl karşılaştırırım?','tr')).toBeNull();expect(mock.db.select).not.toHaveBeenCalled();
 });
});

import {importedAdapters} from '../src/lib/providers/imported';
import {it,expect,afterAll} from 'vitest';
import {eq} from 'drizzle-orm';
import {db,sql} from '../src/db';
import {providers,offers,priceObservations} from '../src/db/schema';
import {demoOffers} from '../src/lib/demo';
import {searchSchema} from '../src/lib/types';
import {searchOffers,clearCache} from '../src/lib/providers/engine';
it.skipIf(!process.env.DATABASE_URL)('PostgreSQL transaction, observations and live source activation',async()=>{
 const offer={...demoOffers.find(o=>o.id==='el-1')!,id:'integration-test-offer',providerId:'authorized-feed',demo:false,updatedAt:new Date().toISOString(),url:'https://shop.example.com/item'};
 await db.insert(providers).values({id:'authorized-feed',name:'Test',enabled:false,verifiedAt:new Date(),allowedHosts:['shop.example.com']}).onConflictDoUpdate({target:providers.id,set:{enabled:false,verifiedAt:new Date()}});
 try{
 await db.transaction(async tx=>{await tx.insert(offers).values({id:offer.id,category:offer.category,providerId:offer.providerId,entityId:offer.entityId,variantKey:offer.variantKey,currency:offer.currency,price:offer.price,updatedAt:new Date(offer.updatedAt),payload:offer});await tx.insert(priceObservations).values({offerId:offer.id,amount:offer.price,currency:offer.currency,observedAt:new Date(offer.updatedAt),demo:false});});
 clearCache();expect((await searchOffers('elektronik',searchSchema.parse({}),{mode:'live',adapters:importedAdapters})).total).toBe(0);
 await db.update(providers).set({enabled:true}).where(eq(providers.id,'authorized-feed'));clearCache();const result=await searchOffers('elektronik',searchSchema.parse({}),{mode:'live',adapters:importedAdapters});expect(result.offers.map(o=>o.id)).toContain(offer.id);expect(result.offers.every(o=>!o.demo)).toBe(true);
 expect((await db.select().from(priceObservations).where(eq(priceObservations.offerId,offer.id)))[0].amount).toBe(offer.price);
 }finally{await db.delete(priceObservations).where(eq(priceObservations.offerId,offer.id));await db.delete(offers).where(eq(offers.id,offer.id));await db.update(providers).set({enabled:false}).where(eq(providers.id,'authorized-feed'));clearCache();}
});
afterAll(()=>sql.end());

import {allCategories} from './engine';
import {offerSchema,type ProviderAdapter} from '../types';
// Reviewed, permissioned snapshots only. API adapters can be registered here after documentation/credential verification.
export const importedAdapters:ProviderAdapter[]=process.env.DATABASE_URL?[{
 id:'authorized-feed',categories:allCategories,
 async search({category}){
 const {db}=await import('@/db');const {offers,providers}=await import('@/db/schema');const {eq,and}=await import('drizzle-orm');
 const rows=await db.select({payload:offers.payload,verified:providers.verifiedAt}).from(offers).innerJoin(providers,eq(offers.providerId,providers.id)).where(and(eq(offers.category,category),eq(providers.enabled,true),eq(providers.id,'authorized-feed'))).limit(1000);
 return {offers:rows.filter(r=>r.verified).map(r=>offerSchema.parse(r.payload))};
 }
}]:[];

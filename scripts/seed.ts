import {db,sql} from '../src/db';
import * as tables from '../src/db/schema';
import {categories} from '../src/lib/categories';
import {demoOffers} from '../src/lib/demo';
async function main(){await db.transaction(async tx=>{
 for(const c of categories)await tx.insert(tables.categories).values({id:c.slug,name:c.name}).onConflictDoNothing();
 for(const id of ['ornek-a','ornek-b'])await tx.insert(tables.providers).values({id,name:id==='ornek-a'?'Örnek Sağlayıcı A':'Örnek Sağlayıcı B',enabled:false}).onConflictDoNothing();
 for(const o of demoOffers)await tx.insert(tables.offers).values({id:o.id,category:o.category,providerId:o.providerId,entityId:o.entityId,variantKey:o.variantKey,currency:o.currency,price:o.price,updatedAt:new Date(o.updatedAt),payload:o}).onConflictDoNothing();
 });console.log('Demo kayıtları yüklendi; canlı sağlayıcılar etkinleştirilmedi.');}
main().catch(()=>{console.error('Seed başarısız.');process.exitCode=1;}).finally(()=>sql.end());

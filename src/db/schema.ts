import {pgTable,text,boolean,timestamp,jsonb,bigint,index,integer,primaryKey,customType,numeric} from 'drizzle-orm/pg-core';
import type {Offer} from '@/lib/types';
const bytea=customType<{data:Buffer;driverData:Buffer}>({dataType:()=> 'bytea',toDriver:value=>value,fromDriver:value=>Buffer.from(value)});
export const categories=pgTable('categories',{id:text().primaryKey(),name:text().notNull()});
export const providers=pgTable('providers',{id:text().primaryKey(),name:text().notNull(),enabled:boolean().notNull().default(false),allowedHosts:jsonb().$type<string[]>().notNull().default([]),documentationUrl:text(),permissionReference:text(),verifiedAt:timestamp({withTimezone:true}),lastSyncAt:timestamp({withTimezone:true}),lastError:text()});
export const products=pgTable('products',{id:text().primaryKey(),category:text().notNull().references(()=>categories.id),name:text().notNull(),brand:text(),modelCode:text(),gtin:text()},t=>[index('products_gtin_idx').on(t.gtin)]);
export const variants=pgTable('variants',{id:text().primaryKey(),productId:text().notNull().references(()=>products.id),matchKey:text().notNull().unique(),attributes:jsonb().notNull()});
export const accommodations=pgTable('accommodations',{id:text().primaryKey(),name:text().notNull(),city:text().notNull(),location:jsonb(),attributes:jsonb().notNull()});
export const journeys=pgTable('journeys',{id:text().primaryKey(),kind:text().notNull(),origin:text().notNull(),destination:text().notNull(),departsAt:timestamp({withTimezone:true}),operator:text().notNull(),serviceCode:text().notNull(),attributes:jsonb().notNull()});
export const vehicleListings=pgTable('vehicle_listings',{id:text().primaryKey(),sourceId:text().notNull().unique(),brand:text().notNull(),model:text().notNull(),year:integer().notNull(),mileage:integer().notNull(),attributes:jsonb().notNull()});
export const offers=pgTable('offers',{id:text().primaryKey(),category:text().notNull().references(()=>categories.id),providerId:text().notNull().references(()=>providers.id),entityId:text().notNull(),variantKey:text().notNull(),currency:text().notNull(),price:bigint({mode:'number'}).notNull(),updatedAt:timestamp({withTimezone:true}).notNull(),payload:jsonb().$type<Offer>().notNull()},t=>[index('offers_search_idx').on(t.category,t.providerId,t.updatedAt),index('offers_entity_idx').on(t.entityId,t.variantKey)]);
export const priceObservations=pgTable('price_observations',{id:integer().primaryKey().generatedAlwaysAsIdentity(),offerId:text().notNull().references(()=>offers.id),amount:bigint({mode:'number'}).notNull(),currency:text().notNull(),observedAt:timestamp({withTimezone:true}).notNull(),demo:boolean().notNull()});
export const importRuns=pgTable('import_runs',{id:integer().primaryKey().generatedAlwaysAsIdentity(),createdAt:timestamp({withTimezone:true}).notNull().defaultNow(),providerId:text().notNull(),status:text().notNull(),rowCount:integer().notNull(),report:jsonb().notNull()});
export const matchingIssues=pgTable('matching_issues',{id:integer().primaryKey().generatedAlwaysAsIdentity(),importId:integer().references(()=>importRuns.id),sourceId:text().notNull(),reason:text().notNull(),resolved:boolean().notNull().default(false)});

export const monthlyVisitors=pgTable('monthly_visitors',{month:text().notNull(),visitorHash:text('visitor_hash').notNull()},t=>[primaryKey({columns:[t.month,t.visitorHash]})]);
export const monthlyVisitorTotals=pgTable('monthly_visitor_totals',{month:text().primaryKey(),visitors:bigint({mode:'number'}).notNull().default(0)});

export const yearlyVisitors=pgTable('yearly_visitors',{year:text().notNull(),visitorHash:text('visitor_hash').notNull()},t=>[primaryKey({columns:[t.year,t.visitorHash]})]);
export const yearlyVisitorTotals=pgTable('yearly_visitor_totals',{year:text().primaryKey(),visitors:bigint({mode:'number'}).notNull().default(0),startedAt:timestamp('started_at',{withTimezone:true}).notNull().defaultNow()});

export const communityPriceObservations=pgTable('community_price_observations',{
 id:text().primaryKey(),productName:text('product_name').notNull(),productKey:text('product_key').notNull(),brand:text(),variant:text(),barcode:text(),
 store:text().notNull(),city:text().notNull(),district:text(),priceKurus:integer('price_kurus').notNull(),currency:text().notNull().default('TRY'),
 packageValue:numeric('package_value',{precision:12,scale:3}),unit:text(),packCount:integer('pack_count').notNull().default(1),campaign:text(),
 observedAt:timestamp('observed_at',{withTimezone:true}).notNull(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
 status:text().notNull().default('pending'),submittedAt:timestamp('submitted_at',{withTimezone:true}).notNull().defaultNow(),reviewedAt:timestamp('reviewed_at',{withTimezone:true}),reviewNote:text()
},t=>[index('community_prices_public_search_idx').on(t.status,t.productKey,t.city,t.expiresAt),index('community_prices_moderation_idx').on(t.status,t.submittedAt)]);
export const communityPriceEvidence=pgTable('community_price_evidence',{
 id:text().primaryKey(),observationId:text('observation_id').notNull().references(()=>communityPriceObservations.id,{onDelete:'cascade'}),
 kind:text().notNull(),mimeType:text('mime_type').notNull(),byteLength:integer('byte_length').notNull(),content:bytea().notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
},t=>[index('community_evidence_observation_idx').on(t.observationId)]);

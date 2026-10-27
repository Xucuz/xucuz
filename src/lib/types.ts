import {z} from 'zod';
import type {Category} from './categories';
export const categorySchema=z.enum(['otel','ucak','otobus','market','otomobil','elektronik','beyaz-esya','cicek']);
const amount=z.number().int().nonnegative().max(100_000_000_000);
export const offerSchema=z.object({
 id:z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),category:categorySchema,entityId:z.string().min(1).max(150),variantKey:z.string().min(1).max(300),title:z.string().min(1).max(200),providerId:z.string().regex(/^[a-z0-9-]{1,60}$/),provider:z.string().min(1).max(100),description:z.string().max(1000),
 price:amount,shipping:amount.nullable(),mandatoryFees:amount.nullable(),currency:z.enum(['TRY','EUR','USD']),available:z.boolean(),url:z.string().url().nullable(),source:z.string().min(1).max(300),updatedAt:z.iso.datetime(),demo:z.boolean(),sponsored:z.boolean(),affiliate:z.boolean(),
 attributes:z.record(z.string().max(60),z.union([z.string().max(300),z.number().finite(),z.boolean()])),
 quantity:z.object({value:z.number().positive(),unit:z.enum(['g','kg','ml','l','adet']),packs:z.number().int().positive()}).optional(),
});
export type Offer=z.infer<typeof offerSchema>;
const short=z.string().max(150).default('');
const integer=(min:number,max:number,def:number)=>z.coerce.number().int().min(min).max(max).default(def);
const searchObject=z.object({
 flowerType:short,flowerCount:short,delivery:short,q:short,city:short,district:short,from:short,to:short,start:short,end:short,trip:z.enum(['oneway','return']).default('oneway'),adults:integer(1,9,2),children:integer(0,6,0),ages:short,rooms:integer(1,6,1),passengers:integer(1,9,1),cabin:z.enum(['Ekonomi','Business']).default('Ekonomi'),
 min:z.coerce.number().nonnegative().max(1e9).default(0),max:z.coerce.number().nonnegative().max(1e9).default(1e9),provider:short,feature:short,brand:short,model:short,condition:short,fuel:short,gear:short,year:short,km:short,stars:short,meal:short,cancel:short,stops:short,airline:short,time:short,duration:short,baggage:short,sort:z.enum(['price-asc','price-desc']).default('price-asc'),page:integer(1,1000,1),currency:z.enum(['TRY','EUR','USD']).default('TRY'),
}).superRefine((s,ctx)=>{
 if(s.min>s.max)ctx.addIssue({code:'custom',message:'En düşük fiyat en yüksek fiyattan büyük olamaz.',path:['min']});
 for(const k of ['start','end'] as const)if(s[k]&&!/^\d{4}-\d{2}-\d{2}$/.test(s[k]))ctx.addIssue({code:'custom',message:'Geçerli bir tarih girin.',path:[k]});
 for(const k of ['start','end'] as const)if(s[k]&&(!Number.isFinite(Date.parse(s[k]))||new Date(s[k]).toISOString().slice(0,10)!==s[k]))ctx.addIssue({code:'custom',message:'Geçerli bir takvim tarihi girin.',path:[k]});
 if(s.start&&s.end&&s.end<=s.start)ctx.addIssue({code:'custom',message:'Dönüş / çıkış tarihi başlangıçtan sonra olmalı.',path:['end']});
 if(s.children>0&&s.ages.split(',').filter(Boolean).length!==s.children)ctx.addIssue({code:'custom',message:'Her çocuğun yaşını virgülle ayırarak girin.',path:['ages']});
 if(s.ages&&s.ages.split(',').some(a=>!/^\d{1,2}$/.test(a.trim())||Number(a)>17))ctx.addIssue({code:'custom',message:'Çocuk yaşları 0–17 arasında olmalı.',path:['ages']});
});
export const searchSchema=z.preprocess(v=>v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([,value])=>value!=='')):v,searchObject);
export type Search=z.infer<typeof searchSchema>;
export type SearchResult={offers:Offer[];total:number;page:number;pages:number;warnings:string[];mode:'demo'|'live';providers:string[]};
export type ProviderContext={category:Category;search:Search;signal:AbortSignal;page:number};
export interface ProviderAdapter {id:string;categories:Category[];search(context:ProviderContext):Promise<{offers:Offer[];nextPage?:number}>;}

import {z} from 'zod';
import {normalize} from './categories';
import {turkiyeCities} from './turkiye-cities';

const shortText=(max:number)=>z.string().trim().max(max);
export const communityPriceInput=z.object({
 productName:z.string().trim().min(2).max(120),brand:shortText(80).optional().default(''),variant:shortText(160).optional().default(''),
 barcode:z.string().trim().regex(/^(?:|\d{8}|\d{12,14})$/,'Barkod 8, 12, 13 veya 14 rakam olmalı.').optional().default(''),
 store:z.string().trim().min(2).max(100),city:z.enum(turkiyeCities),district:shortText(80).optional().default(''),
 price:z.coerce.number().finite().positive().max(1_000_000),packageValue:z.coerce.number().finite().positive().max(1_000_000).optional(),unit:z.enum(['g','kg','ml','l','adet','paket']).optional(),packCount:z.coerce.number().int().min(1).max(1000).default(1),
 campaign:shortText(240).optional().default(''),observedAt:z.iso.datetime().or(z.iso.date()),
}).strict().superRefine((value,ctx)=>{
 if(Boolean(value.packageValue)!==Boolean(value.unit))ctx.addIssue({code:'custom',path:['packageValue'],message:'Paket miktarı ve birimini birlikte gir.'});
});
export type CommunityPriceInput=z.infer<typeof communityPriceInput>;
export const communityReviewInput=z.object({id:z.string().uuid(),decision:z.enum(['approve','reject']),note:z.string().trim().max(300).optional().default('')}).strict();
export function productKey(name:string,brand='',variant=''){return normalize([name,brand,variant].filter(Boolean).join(' ')).slice(0,350);}
export function parseImageType(bytes:Uint8Array):'image/jpeg'|'image/png'|'image/webp'|null{
 if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
 if(bytes.length>=8&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a)return 'image/png';
 if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
 return null;
}
export function unitPriceKurus(priceKurus:number,packageValue:number|undefined,unit:string|undefined,packCount:number){
 if(!packageValue||!unit)return null;
 const base=unit==='g'||unit==='ml'?packageValue/1000:packageValue;
 const baseUnit=unit==='g'?'kg':unit==='ml'?'l':unit;
 if(!base||!Number.isFinite(base))return null;
 return {amount:Math.round(priceKurus/(base*packCount)),unit:baseUnit};
}

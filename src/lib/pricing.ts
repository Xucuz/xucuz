import type {Offer,Search} from './types';
export function total(o:Offer){return o.price+(o.shipping??0)+(o.mandatoryFees??0);}
export const complete=(o:Offer)=>o.shipping!==null&&o.mandatoryFees!==null;
export const money=(cents:number,currency='TRY')=>new Intl.NumberFormat('tr-TR',{style:'currency',currency,maximumFractionDigits:2}).format(cents/100);
export function unitPrice(o:Offer){if(!o.quantity)return null;const {value,unit,packs}=o.quantity; const factor=unit==='g'||unit==='ml'?0.001:1;return {price:Math.round(total(o)/(value*factor*packs)),unit:unit==='g'?'kg':unit==='ml'?'l':unit};}
export function nights(start:string,end:string){return Math.round((Date.parse(end)-Date.parse(start))/86400000);}
export function quote(o:Offer,s:Search):Offer {
 const a={...o.attributes}; let multiplier=1;
 if(o.category==='otel'){const n=s.start&&s.end?nights(s.start,s.end):1;multiplier=Math.max(1,n)*s.rooms;a['Giriş']=s.start;a['Çıkış']=s.end;a['Gece']=Math.max(1,n);a['Oda']=s.rooms;a['Yetişkin']=s.adults;a['Çocuk']=s.children;a['Çocuk yaşları']=s.ages;a['Gecelik oda fiyatı']=money(o.price);}
 if(o.category==='ucak'||o.category==='otobus'){multiplier=s.passengers;a['Gidiş']=s.start;a['Dönüş']=s.end;a['Yolcu']=s.passengers;if(o.category==='ucak'){a['Kabin']=s.cabin; a['Seyahat']=s.trip==='return'?'Gidiş-dönüş':'Tek yön';if(s.trip==='return')multiplier*=2;}}
 return {...o,price:o.price*multiplier,mandatoryFees:o.mandatoryFees===null?null:o.mandatoryFees*multiplier,attributes:a};
}
export function matchKey(o:Offer){const attrs=Object.fromEntries(Object.entries(o.attributes).sort(([a],[b])=>a.localeCompare(b)));return `${o.category}:${o.entityId}:${o.variantKey}:${JSON.stringify(attrs)}:${JSON.stringify(o.quantity??null)}`;}

export const isStale=(o:Offer,ttl:number)=>Date.now()-Date.parse(o.updatedAt)>ttl*1000||Date.parse(o.updatedAt)>Date.now()+60000;

import {z} from 'zod';
// Decimal strings are parsed before arithmetic; money is kept in integer kuruş.
export function decimal(value:unknown){if(typeof value!=='string'&&typeof value!=='number')return NaN;let s=String(value).trim();if(/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(s))s=s.replaceAll('.','');if(!/^\d+(?:[.,]\d{1,3})?$/.test(s))return NaN;return Number(s.replace(',','.'));}
const numeric=(min:number,max:number)=>z.preprocess(decimal,z.number().finite().min(min).max(max));
const price=z.preprocess(v=>{const n=decimal(v);return Number.isFinite(n)&&Math.abs(n*100-Math.round(n*100))<0.00001?Math.round(n*100):NaN;},z.number().int().min(1).max(100_000_000));
const fee=z.preprocess(v=>{const n=decimal(v);return Number.isFinite(n)&&Math.abs(n*100-Math.round(n*100))<0.00001?Math.round(n*100):NaN;},z.number().int().min(0).max(100_000_000));
const count=z.preprocess(decimal,z.number().int().min(1).max(1000));
const unit=z.enum(['g','kg','ml','l','adet']);
const item=z.object({price,quantity:numeric(.001,1_000_000),unit,packs:count});
export const unitSchema=z.object({a:item,b:item}).refine(v=>dimension(v.a.unit)===dimension(v.b.unit),{message:'Ağırlık, hacim ve adet birbiriyle karşılaştırılamaz.'});
const dimension=(u:z.infer<typeof unit>)=>u==='g'||u==='kg'?'kg':u==='ml'||u==='l'?'l':'adet';
const baseAmount=(v:z.infer<typeof item>)=>v.quantity*v.packs*(v.unit==='g'||v.unit==='ml'?.001:1);
export function compareUnits(input:unknown){const {a,b}=unitSchema.parse(input);const aUnit=a.price/baseAmount(a),bUnit=b.price/baseAmount(b);const difference=Math.abs(aUnit-bUnit);return {aUnit,bUnit,unit:dimension(a.unit),winner:difference<.000001?'equal':aUnit<bUnit?'a':'b',percent:difference<.000001?0:difference/Math.max(aUnit,bUnit)*100,aAmount:baseAmount(a),bAmount:baseAmount(b)};}
export const campaignSchema=z.discriminatedUnion('mode',[
 z.object({mode:z.literal('bundle'),price,buy:count,pay:count}).refine(v=>v.pay<=v.buy,{message:'Ödenen adet alınan adetten fazla olamaz.'}),
 z.object({mode:z.literal('second'),price,percent:numeric(0,100)}),
 z.object({mode:z.literal('coupon'),price,quantity:count,percent:numeric(0,100),coupon:fee}).refine(v=>v.coupon<=Math.round(v.price*v.quantity*(1-v.percent/100)),{message:'Kupon tutarı indirim sonrası sepeti aşamaz.'})
]);
export function campaign(input:unknown){const v=campaignSchema.parse(input);let quantity:number,total:number,regular:number;
 if(v.mode==='bundle'){quantity=v.buy;regular=v.price*v.buy;total=v.price*v.pay;}
 else if(v.mode==='second'){quantity=2;regular=v.price*2;total=v.price+Math.round(v.price*(1-v.percent/100));}
 else{quantity=v.quantity;regular=v.price*v.quantity;total=Math.round(regular*(1-v.percent/100))-v.coupon;}
 return {quantity,total,regular,saving:regular-total,effective:total/quantity,percent:(regular-total)/regular*100};
}
export const installmentSchema=z.object({cash:price,monthly:price,months:z.preprocess(decimal,z.number().int().min(1).max(120)),fee});
export function installments(input:unknown){const v=installmentSchema.parse(input);const total=v.monthly*v.months+v.fee;const difference=total-v.cash;return {total,cash:v.cash,difference,percent:difference/v.cash*100,months:v.months,monthly:v.monthly,fee:v.fee};}
export const tools=[{slug:'birim-fiyat',kind:'unit',title:'Hangisi daha hesaplı?',description:'Farklı gramaj ve paketleri kg, litre veya adet başına karşılaştır.',label:'Birim fiyat'},{slug:'indirim-hesapla',kind:'campaign',title:'İndirim gerçekten ne kadar?',description:'Çoklu alım, ikinci ürün indirimi ve kuponun gerçek tutarını gör.',label:'Kampanya hesabı'},{slug:'taksit-mi-pesin-mi',kind:'installment',title:'Taksit mi, peşin mi?',description:'Taksitlerin toplamını, bilinen ek ücretleri ve peşin fiyat farkını hesapla.',label:'Taksit ve peşin'}] as const;
export type ToolKind=typeof tools[number]['kind'];

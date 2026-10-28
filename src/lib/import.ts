import {parse} from 'csv-parse/sync';
import {offerSchema,type Offer} from './types';
import {safeProviderUrl} from './security';
export function validateImport(content:string,format:'json'|'csv',hosts:string[]){
 let rows:unknown;try{rows=format==='json'?JSON.parse(content):(parse(content,{columns:true,skip_empty_lines:true,bom:true,max_record_size:32000}) as Record<string,string>[]).map((r:Record<string,string>)=>({...r,price:Number(r.price),shipping:r.shipping===''?null:Number(r.shipping),mandatoryFees:r.mandatoryFees===''?null:Number(r.mandatoryFees),available:r.available==='true',demo:r.demo==='true',sponsored:r.sponsored==='true',affiliate:r.affiliate==='true',url:r.url||null,attributes:JSON.parse(r.attributes||'{}'),...(r.quantity?{quantity:JSON.parse(r.quantity)}:{})}));}catch{return {valid:[] as Offer[],errors:[{row:0,message:'Geçersiz JSON / CSV.'}]};}
 if(!Array.isArray(rows)||rows.length>1000)return {valid:[] as Offer[],errors:[{row:0,message:'En fazla 1000 satırlık dizi bekleniyor.'}]};
 const valid:Offer[]=[];const errors:{row:number;message:string}[]=[];const ids=new Set<string>();
 rows.forEach((row,i)=>{const result=offerSchema.safeParse(row);if(!result.success){errors.push({row:i+1,message:result.error.issues.map(e=>`${e.path.join('.')}: ${e.message}`).join('; ')});return;}const o=result.data;
 if(o.demo||o.providerId!=='authorized-feed'||!o.url||!safeProviderUrl(o.url,hosts)||Date.parse(o.updatedAt)>Date.now()+60000||ids.has(o.id)){errors.push({row:i+1,message:'Kaynak, demo işareti, zaman, benzersiz kimlik veya izinli HTTPS URL kontrolü başarısız.'});return;}
 ids.add(o.id);valid.push(o);});return {valid,errors};
}

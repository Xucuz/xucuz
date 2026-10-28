import {offerSchema,type Offer} from '../types';
import {normalize} from '../categories';
import type {PublicPage,PublicSource} from './catalog';
export function text(value:string){return value.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();}
function property(html:string,name:string){const tags=html.match(/<(?:meta|link)\b[^>]*>/gi)??[];for(const tag of tags){const attrs=Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1].toLowerCase(),m[2]??m[3]]));if(attrs.itemprop===name)return attrs.content??attrs.href;}return undefined;}
export function cents(value:unknown){if(typeof value!=='string'&&typeof value!=='number')throw new Error('missing price');const s=String(value);if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw new Error('ambiguous price');const amount=Math.round(Number(s)*100);if(!Number.isSafeInteger(amount)||amount<=0||amount>100_000_000_000)throw new Error('invalid price');return amount;}
function records(value:unknown):Record<string,unknown>[]{if(Array.isArray(value))return value.flatMap(records);if(!value||typeof value!=='object')return [];const o=value as Record<string,unknown>;return [o,...(o['@graph']?records(o['@graph']):[])];}
export function parsePage(html:string,source:PublicSource,page:PublicPage,observedAt:string):Offer{
 const title=text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]??'');
 if(!title||!normalize(title).includes(normalize(page.expectedName)))throw new Error('product identity changed');
 const blocks=[...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
 const products=blocks.flatMap(m=>{try{return records(JSON.parse(m[1]));}catch{return [];}}).filter(o=>o['@type']==='Product'||(Array.isArray(o['@type'])&&o['@type'].includes('Product')));
 const product=products.find(p=>normalize(String(p.name??''))===normalize(title));
 let amount:number;let currency:unknown;let availability:unknown;let sku:unknown;let gtin:unknown;
 if(product){const offers=records(product.offers).filter(o=>o['@type']==='Offer');if(offers.length!==1)throw new Error('ambiguous offers');const offer=offers[0];amount=cents(offer.price);currency=offer.priceCurrency;availability=offer.availability;sku=product.mpn??product.sku;gtin=product.gtin13??product.gtin14??product.gtin;}
 else if(source.id==='incehesap-public'){amount=cents(property(html,'price'));currency=property(html,'priceCurrency');availability=property(html,'availability');sku=property(html,'sku');gtin=property(html,'gtin13')??property(html,'gtin14');}
 else throw new Error('structured product price missing');
 if(!['TRY','EUR','USD'].includes(String(currency)))throw new Error('currency unknown');
 if(!/^https?:\/\/schema\.org\/InStock$/.test(String(availability)))throw new Error('not in stock');
 // The structured price must also occur in the ordinary page, not only in a script/meta attribute.
 const body=text(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')).replace(/(\d)\s+([,.])/g,'$1$2');
 const formatted=(amount/100).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});const integer=(amount/100).toLocaleString('tr-TR',{maximumFractionDigits:0});
 if(!body.includes(formatted)&&!(amount%100===0&&new RegExp(`(?:^|[^0-9])${integer.replace(/\./g,'\\.')}\\s*(?:TL|₺)`).test(body)))throw new Error('visible price mismatch');
 const attributes={...page.attributes,'Kapsam':'Herkese açık ürün sayfası; adres/üyelik seçilmedi','Stok bilgisi':'Sayfada stokta; adres bazlı uygunluk doğrulanmadı',...(sku?{'Kaynak ürün kodu':String(sku)}:{}),...(gtin?{'Barkod':String(gtin)}:{})};
 return offerSchema.parse({id:page.id,category:page.category,entityId:`${source.id}:${String(gtin??sku??page.id)}`,variantKey:JSON.stringify(page.attributes),title,providerId:source.id,provider:source.name,description:'Sağlayıcının herkese açık ürün sayfasında gözlenen fiyat. Teslimat/kargo, adres bazlı stok ve ek ücretler doğrulanmadı. Farklı ürün veya buketleri aynı ürünün teklifleri gibi değerlendirmeyin.',price:amount,shipping:null,mandatoryFees:null,currency,available:true,url:page.url,source:`${source.name} · herkese açık HTML`,updatedAt:observedAt,demo:false,sponsored:false,affiliate:false,attributes});
}

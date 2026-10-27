import {z} from 'zod';
import {offerSchema,type Offer} from '../types';
import {pageById,publicSources,SNAPSHOT_URL} from './catalog';
import fallback from '../../../data/public-offers.json';
import {freshness} from '../categories';
const schema=z.object({version:z.literal(1),generatedAt:z.iso.datetime(),offers:z.array(offerSchema).max(1000),statuses:z.array(z.object({id:z.string(),checkedAt:z.iso.datetime(),success:z.number(),failed:z.number(),message:z.string()})).max(50)});
export function validateSnapshot(value:unknown){const result=schema.parse(value);const offers=result.offers.filter(o=>{const known=pageById(o.id);return known&&!o.demo&&o.url===known.page.url&&o.category===known.page.category&&o.providerId===known.source.id&&Date.parse(o.updatedAt)<=Date.now()+60000&&Date.now()-Date.parse(o.updatedAt)<=freshness[o.category]*1000;});return {...result,offers};}
let cached:{until:number;value:ReturnType<typeof validateSnapshot>}|undefined;
export async function loadPublicSnapshot(){if(process.env.PUBLIC_PRICES_ENABLED==='0')return validateSnapshot({...fallback,offers:[],statuses:[]});if(cached&&cached.until>Date.now())return validateSnapshot(cached.value);
 let value:ReturnType<typeof validateSnapshot>;try{const r=await fetch(SNAPSHOT_URL,{signal:AbortSignal.timeout(3000),cache:'no-store',redirect:'error'});if(!r.ok)throw new Error('snapshot unavailable');const declared=Number(r.headers.get('content-length'));if(declared>2_000_000)throw new Error('too large');const raw=await r.text();if(raw.length>2_000_000)throw new Error('too large');value=validateSnapshot(JSON.parse(raw));}catch{value=validateSnapshot(fallback);}cached={until:Date.now()+60000,value};return value;
}
export const publicPageAdapters=publicSources.map(source=>({id:source.id,categories:[...new Set(source.pages.map(p=>p.category))],async search({category}:{category:Offer['category']}){const snapshot=await loadPublicSnapshot();return {offers:snapshot.offers.filter(o=>o.providerId===source.id&&o.category===category)};}}));
export async function findPublicOffer(id:string){if(!pageById(id))return undefined;return (await loadPublicSnapshot()).offers.find(o=>o.id===id);}

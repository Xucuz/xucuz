import {NextResponse} from 'next/server';
import {z} from 'zod';
import {productGroups,searchProducts} from '@/lib/products';
import {rateLimit} from '@/lib/security';
const schema=z.object({q:z.string().max(120).default(''),group:z.string().refine(v=>!v||productGroups.some(g=>g.slug===v)).default(''),kind:z.enum(['','type','model']).default(''),limit:z.coerce.number().int().min(1).max(1000).default(8),page:z.coerce.number().int().min(1).max(1000).default(1)});
export async function GET(request:Request){const headers={'Cache-Control':'no-store'};if(!rateLimit('product-suggestions',600))return NextResponse.json({error:'Çok fazla arama isteği.'},{status:429,headers});const parsed=schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!parsed.success)return NextResponse.json({error:'Geçersiz ürün araması.'},{status:400,headers});const {q,group,kind,limit,page}=parsed.data;const all=searchProducts(q,50_000,group,kind);return NextResponse.json({total:all.length,page,pages:Math.max(1,Math.ceil(all.length/limit)),items:all.slice((page-1)*limit,page*limit).map(({id,name,group,groupLabel,kind})=>({id,name,group,groupLabel,kind}))},{headers});}

import {NextResponse} from 'next/server';
import {categoryFor} from '@/lib/categories';
import {searchSchema} from '@/lib/types';
import {searchOffers} from '@/lib/providers/engine';
import {rateLimit} from '@/lib/security';
export async function GET(request:Request){
 if(!rateLimit('public-search',120))return NextResponse.json({error:'Çok fazla istek. Bir dakika sonra tekrar deneyin.'},{status:429});
 const params=new URL(request.url).searchParams;const c=categoryFor(params.get('category')??'');const s=searchSchema.safeParse(Object.fromEntries(params));
 if(!c||!s.success)return NextResponse.json({error:!s.success?s.error.issues[0].message:'Geçersiz kategori.'},{status:400});
 return NextResponse.json(await searchOffers(c.slug,s.data),{headers:{'Cache-Control':'no-store'}});
}

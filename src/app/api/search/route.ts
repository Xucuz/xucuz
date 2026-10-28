import {NextResponse} from 'next/server';
import {categoryFor} from '@/lib/categories';
import {searchSchema} from '@/lib/types';
import {searchOffers} from '@/lib/providers/engine';
import {inLaunchScope} from '@/lib/site-scope';
import {mode} from '@/lib/providers/engine';
import {rateLimit} from '@/lib/security';
export async function GET(request:Request){
 if(!rateLimit('public-search',120))return NextResponse.json({error:'Çok fazla istek. Bir dakika sonra tekrar deneyin.'},{status:429});
 const params=new URL(request.url).searchParams;const c=categoryFor(params.get('category')??'');const s=searchSchema.safeParse(Object.fromEntries(params));
 if(!c||!s.success)return NextResponse.json({error:!s.success?s.error.issues[0].message:'Geçersiz kategori.'},{status:400});
 if(mode()==='live'&&!inLaunchScope(c.slug))return NextResponse.json({offers:[],total:0,page:s.data.page,pages:0,warnings:['Bu kategori ilk yayın kapsamında değil. Elektronik ve beyaz eşyaya odaklanıyoruz.'],mode:'live',providers:[]},{headers:{'Cache-Control':'no-store'}});
 return NextResponse.json(await searchOffers(c.slug,s.data),{headers:{'Cache-Control':'no-store'}});
}

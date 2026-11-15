import {NextResponse} from 'next/server';
import {getCityGuide} from '@/lib/city-guide';
import {getCityGuidePhotos} from '@/lib/city-guide-photos';

export const revalidate=86400;
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const city=getCityGuide(slug);
 if(!city)return NextResponse.json({error:'Şehir bulunamadı.'},{status:404});
 const topic=new URL(request.url).searchParams.get('topic')??'';
 const photos=await getCityGuidePhotos(city.name,topic||'city',12);
 return NextResponse.json({photos,source:'Wikimedia Commons',city:city.name,topic:topic||'city'},{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'}});
}

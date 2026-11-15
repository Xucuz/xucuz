import {NextResponse} from 'next/server';
import {getCityGuide} from '@/lib/city-guide';
import {getLicensedCityPhotos} from '@/lib/city-guide-photos';

export const revalidate=86400;
const topicQueries:Record<string,(city:string)=>string>={
 food:city=>city==='Adana'?'Adana traditional food kebab Turkish cuisine':`${city} Turkey traditional food cuisine`,
 sights:city=>`${city} Turkey landmark historic architecture landscape`,
 products:city=>`${city} Turkey handicraft local products`,
 clothing:city=>`${city} Turkey traditional clothing textile`,
};

export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const city=getCityGuide(slug);
 if(!city)return NextResponse.json({error:'Şehir bulunamadı.'},{status:404});
 const topic=new URL(request.url).searchParams.get('topic')??'';
 const search=topicQueries[topic]?.(city.name)??`${city.name} Turkey`;
 const photos=await getLicensedCityPhotos(search,12);
 return NextResponse.json({photos,source:'Wikimedia Commons',city:city.name,topic:topic||'city'},{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'}});
}

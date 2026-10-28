import type {Metadata} from 'next';
import {ToolPage} from '@/components/tool-page';
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string>>}):Promise<Metadata>{return {title:'Birim fiyat karşılaştırma',description:'Gramaj ve paket miktarlarını kg, litre veya adet başına karşılaştır.',alternates:{canonical:'/birim-fiyat'},...(Object.keys(await searchParams).length?{robots:{index:false,follow:true}}:{})};}
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <ToolPage kind='unit' searchParams={searchParams}/>;}

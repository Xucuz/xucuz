import type {Metadata} from 'next';
import {ToolPage} from '@/components/tool-page';
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string>>}):Promise<Metadata>{return {title:'Gerçek indirim hesaplama',description:'Çoklu alım, ikinci ürün indirimi ve kupon maliyetini hesapla.',alternates:{canonical:'/indirim-hesapla'},...(Object.keys(await searchParams).length?{robots:{index:false,follow:true}}:{})};}
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <ToolPage kind='campaign' searchParams={searchParams}/>;}

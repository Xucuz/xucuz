import type {Metadata} from 'next';
import {ToolPage} from '@/components/tool-page';
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string>>}):Promise<Metadata>{return {title:'Taksit mi peşin mi?',description:'Taksit toplamını ve peşin fiyat farkını bilinen ek ücretlerle karşılaştır.',alternates:{canonical:'/taksit-mi-pesin-mi'},...(Object.keys(await searchParams).length?{robots:{index:false,follow:true}}:{})};}
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <ToolPage kind='installment' searchParams={searchParams}/>;}

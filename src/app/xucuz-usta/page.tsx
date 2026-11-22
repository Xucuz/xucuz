import type {Metadata} from 'next';
import {XucuzUstaDemo} from '@/components/xucuz-usta-demo';

export const metadata:Metadata={
  title:'Xucuz Usta — Yerel hizmetler için örnek platform',
  description:'Boya, tesisat, elektrik, montaj, temizlik ve diğer ince işçilikler için örnek hizmet pazaryeri.',
  robots:{index:false,follow:false},
};

export default async function XucuzUstaPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  const value=(item:string|string[]|undefined)=>Array.isArray(item)?item[0]??'':item??'';
  return <XucuzUstaDemo initialService={value(params.service)} initialTask={value(params.task).slice(0,500)}/>;
}

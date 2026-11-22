import type {Metadata} from 'next';
import {XucuzUstaDemo} from '@/components/xucuz-usta-demo';

export const metadata:Metadata={
  title:'Xucuz Usta — Yerel hizmetler için örnek platform',
  description:'Boya, tesisat, elektrik, montaj, temizlik ve diğer ince işçilikler için örnek hizmet pazaryeri.',
  robots:{index:false,follow:false},
};

export default function XucuzUstaPage(){return <XucuzUstaDemo/>;}

import type {Metadata,Viewport} from 'next';
import {XucuzWorldHome} from '@/components/xucuz-world-home';
export const metadata:Metadata={title:'Xucin’in Sihirli Dükkânı',description:'Doğrulanmış fiyatları bul, sepetini hesapla, şehirleri keşfet. Xucin’in Sihirli Dükkânı.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#07172c',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <XucuzWorldHome/>;}

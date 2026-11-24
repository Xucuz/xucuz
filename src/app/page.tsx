import type {Metadata,Viewport} from 'next';
import {XucuzWorldHome} from '@/components/xucuz-world-home';
export const metadata:Metadata={title:'Canlı Futbol ve Basketbol Maçları',description:'Futbol ve basketbol maçlarını kaynak verisiyle takip edin. Canlı olaylar yalnızca doğrulanmış sağlayıcı verisiyle gösterilir.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#07172c',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <XucuzWorldHome/>;}

import type {Metadata,Viewport} from 'next';
import {CityGuideHome} from '@/components/city-guide-home';
export const metadata:Metadata={title:'Xucuz — Türkiye’yi 81 İliyle Keşfet',description:'Türkiye’nin 81 ilinden lisanslı fotoğraflar, yöresel lezzetler, alışveriş ve gezi rehberleri.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#176bc5',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <CityGuideHome/>;}

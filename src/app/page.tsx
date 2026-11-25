import type {Metadata,Viewport} from 'next';
import {XucuzWorldHome} from '@/components/xucuz-world-home';
export const metadata:Metadata={title:'En Ucuz Ürünleri Ara ve Karşılaştır',description:'Xucuz’da ürün, seyahat ve alışveriş kategorilerinde doğrulanmış kaynakları ara; gerçek fiyat kaydı yoksa fiyat gösterilmez.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#07172c',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <XucuzWorldHome/>;}

import type {Metadata,Viewport} from 'next';
import {MarketplaceHome} from '@/components/marketplace-home';
export const metadata:Metadata={title:'Toplulukla güncel fiyat gözlemleri',description:'81 ilde ürün fiyatlarını ara, bölgedeki kanıtlı topluluk gözlemlerini karşılaştır ve kendi gözlemini paylaş.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#102a43',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <MarketplaceHome/>;}

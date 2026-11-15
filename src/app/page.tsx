import type {Metadata,Viewport} from 'next';
import {MarketplaceHome} from '@/components/marketplace-home';
import {CityGuideHomeSection} from '@/components/city-guide-directory';
export const metadata:Metadata={title:'Xucuz — Fiyat karşılaştırma ve 81 İl Rehberi',description:'Doğrulanmış topluluk fiyatlarını karşılaştır; Türkiye’nin 81 ili için fotoğraflı şehir rehberlerini keşfet.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#176bc5',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <><MarketplaceHome/><CityGuideHomeSection/></>;}

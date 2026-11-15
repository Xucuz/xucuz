import type {Metadata,Viewport} from 'next';
import {CityGuideHome} from '@/components/city-guide-home';
import {getCityGuidePhotos} from '@/lib/city-guide-photos';
export const metadata:Metadata={title:'Xucuz — Türkiye’yi 81 İliyle Keşfet',description:'Türkiye’nin 81 ilinden lisanslı fotoğraflar, yöresel lezzetler, alışveriş ve gezi rehberleri.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#176bc5',width:'device-width',initialScale:1,viewportFit:'cover'};
export default async function Home(){const [photos,foodPhotos]=await Promise.all([getCityGuidePhotos('Adana','city',12),getCityGuidePhotos('Adana','food',8)]);return <CityGuideHome initialPhotos={photos} initialFoodPhotos={foodPhotos}/>;}

import type {Metadata,Viewport} from 'next';
import {CityGuideHome} from '@/components/city-guide-home';
import {getLicensedCityPhotos} from '@/lib/city-guide-photos';
export const metadata:Metadata={title:'Xucuz — Türkiye’yi 81 İliyle Keşfet',description:'Türkiye’nin 81 ilinden lisanslı fotoğraflar, yöresel lezzetler, alışveriş ve gezi rehberleri.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#176bc5',width:'device-width',initialScale:1,viewportFit:'cover'};
export default async function Home(){const [photos,foodPhotos]=await Promise.all([getLicensedCityPhotos('Adana Turkey city landmark',12),getLicensedCityPhotos('Adana Turkey traditional food kebab Turkish cuisine',8)]);return <CityGuideHome initialPhotos={photos} initialFoodPhotos={foodPhotos}/>;}

import type {Metadata} from 'next';
import {CityGuideDirectory} from '@/components/city-guide-directory';
export const metadata:Metadata={title:'81 İl Rehberi | Türkiye şehirleri',description:'Türkiye’nin 81 ili için şehir rehberi: lisanslı fotoğraf galerileri, yöresel mutfak, el sanatları, gezi noktaları ve alışveriş aramaları.',alternates:{canonical:'/81-il-rehberi'}};
export default function Page(){return <CityGuideDirectory/>;}

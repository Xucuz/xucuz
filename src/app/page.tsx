import type {Metadata,Viewport} from 'next';
import {XucuzWorldHome} from '@/components/xucuz-world-home';
import {getGoogleTrends} from '@/lib/google-trends';
import type {GoogleTrend} from '@/lib/google-trends';
import {localizedTrendPath} from '@/lib/trend-locales';
export const metadata:Metadata={title:'Dünya Trendleri ve Doğrulanmış Fiyat Rehberi',description:'Türkiye ve dünyada öne çıkan aramaları kaynağıyla keşfet; alışverişte doğrulanmış fiyatları ve rehberleri incele.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#07172c',width:'device-width',initialScale:1,viewportFit:'cover'};
export default async function Home(){let trends:GoogleTrend[]=[];try{trends=await getGoogleTrends();}catch{/* Keep the homepage available when the trend source is unavailable. */}return <XucuzWorldHome initialTrends={trends.map(trend=>({...trend,href:localizedTrendPath('tr',trend)}))}/>;}

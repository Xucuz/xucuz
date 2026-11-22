import type {Metadata,Viewport} from 'next';
import {XucuzWorldHome} from '@/components/xucuz-world-home';
import {getTurkeyGoogleTrends} from '@/lib/google-trends';
import type {GoogleTrend} from '@/lib/google-trends';
import {localizedTrendPath} from '@/lib/trend-locales';
import {turkeyShoppingTrends} from '@/lib/shopping-trends';
export const metadata:Metadata={title:'Türkiye’de Yükselen Alışveriş Ürünü Aramaları',description:'Google Trends Türkiye akışında yükselen ürün aramalarını kaynak bilgisiyle keşfet. Bu liste satış verisi veya kesin arama sıralaması değildir.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#07172c',width:'device-width',initialScale:1,viewportFit:'cover'};
export default async function Home(){let trends:GoogleTrend[]=[];let sourceUnavailable=false;try{trends=turkeyShoppingTrends(await getTurkeyGoogleTrends());}catch{sourceUnavailable=true;}return <XucuzWorldHome initialTrends={trends.map(trend=>({...trend,href:localizedTrendPath('tr',trend)}))} initialSourceUnavailable={sourceUnavailable}/>;}

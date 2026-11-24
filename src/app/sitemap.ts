export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
import {guides} from '@/lib/guides';
import {tools} from '@/lib/calculators';
import {mode} from '@/lib/providers/engine';
import {getGoogleTrends} from '@/lib/google-trends';
import {localizedTrendPath, TREND_LOCALES} from '@/lib/trend-locales';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(mode()==='demo'||process.env.VERCEL_ENV==='preview')return [];
 const base=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';
 const paths=['/','/canli-maclar','/market-rehberi','/rehberler',...guides.map(g=>`/rehberler/${g.slug}`),...tools.map(t=>`/${t.slug}`),'/hakkimizda','/iletisim','/gizlilik','/kullanim-kosullari','/affiliate'];
 const core=paths.map(path=>({url:`${base}${path}`}));
 const localized=TREND_LOCALES.map(locale=>({url:`${base}/${locale}`}));
 let details:MetadataRoute.Sitemap=[];
 try {
  const trends=await getGoogleTrends();
  details=trends.flatMap(trend=>TREND_LOCALES.map(locale=>({url:`${base}${localizedTrendPath(locale,trend)}`,...(trend.publishedAt?{lastModified:new Date(trend.publishedAt)}:{})})));
 } catch { /* Keep the canonical site and language landings available if the source is down. */ }
 return [...core,...localized,...details];
}

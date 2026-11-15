export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
import {guides} from '@/lib/guides';
import {tools} from '@/lib/calculators';
import {mode} from '@/lib/providers/engine';
import {cityGuides} from '@/lib/city-guide';
export default function sitemap():MetadataRoute.Sitemap{if(mode()==='demo')return [];const base=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';return ['/','/market-rehberi','/rehberler','/81-il-rehberi',...cityGuides.map(city=>`/81-il-rehberi/${city.slug}`),...guides.map(g=>`/rehberler/${g.slug}`),...tools.map(t=>`/${t.slug}`),'/hakkimizda','/iletisim','/gizlilik','/kullanim-kosullari','/affiliate'].map(path=>({url:`${base}${path}`}));}

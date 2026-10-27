export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
import {guides} from '@/lib/guides';
import {tools} from '@/lib/calculators';
import {mode} from '@/lib/providers/engine';
export default function sitemap():MetadataRoute.Sitemap{if(mode()==='demo')return [];const base=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';return ['/','/rehberler',...guides.map(g=>`/rehberler/${g.slug}`),...tools.map(t=>`/${t.slug}`),'/hakkimizda','/iletisim','/gizlilik','/kullanim-kosullari','/affiliate'].map(path=>({url:`${base}${path}`}));}

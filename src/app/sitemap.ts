export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
import {tools} from '@/lib/calculators';
import {mode} from '@/lib/providers/engine';
export default function sitemap():MetadataRoute.Sitemap{if(mode()==='demo')return [];const base=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';return ['/',...tools.map(t=>`/${t.slug}`),'/hakkimizda','/iletisim','/gizlilik','/kullanim-kosullari','/affiliate'].map(path=>({url:`${base}${path}`}));}

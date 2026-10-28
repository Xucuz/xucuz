export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
import {mode} from '@/lib/providers/engine';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',disallow:mode()==='demo'?'/':['/admin','/api/','/go/','/favoriler','/karsilastir','/teklif/','/*?*']},sitemap:`${process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000'}/sitemap.xml`};}

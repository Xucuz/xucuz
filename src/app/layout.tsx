export const dynamic='force-dynamic';
import type {Metadata} from 'next';
import {cookies,headers} from 'next/headers';
import Script from 'next/script';
import {Analytics} from '@vercel/analytics/next';
import {GoogleAnalytics} from '@/components/google-analytics';
import {mode} from '@/lib/providers/engine';
import {LiveQaRoute} from '@/components/live-qa-route';
import {LiveChat} from '@/components/live-chat';
import {LanguageProvider} from '@/components/language-provider';
import {PwaRegister} from '@/components/pwa-register';
import {WorldFooter,WorldHeader} from '@/components/world-shell';
import './xucuz-world.css';
import './globals.css';
import './trends-home.css';
import './trend-pages.css';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';
const googleVerification=process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const indexable=mode()!=='demo'&&process.env.VERCEL_ENV!=='preview';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Xucuz — Xucin’in Sihirli Dükkânı',template:'%s | Xucuz'},description:'Doğrulanmış fiyatları bul, sepetini hesapla, şehirleri keşfet. Xucin’in Sihirli Dükkânı.',applicationName:'Xucuz',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/xucina-icon-192.png',sizes:'192x192',type:'image/png'},{url:'/xucina-icon-512.png',sizes:'512x512',type:'image/png'}],apple:{url:'/xucina-icon-192.png',sizes:'192x192',type:'image/png'}},other:{'google-adsense-account':'ca-pub-9203233526232260'},...(googleVerification?{verification:{google:googleVerification}}:{}),openGraph:{type:'website',locale:'tr_TR',url:siteUrl,siteName:'Xucuz',title:'Xucuz — Xucin’in Sihirli Dükkânı',description:'Doğrulanmış fiyatlar, sepet hesabı ve keşif.'},twitter:{card:'summary',title:'Xucuz — Xucin’in Sihirli Dükkânı',description:'Doğrulanmış fiyatlar, sepet hesabı ve keşif.'},robots:{index:indexable,follow:mode()!=='demo'}};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <RootDocument>{children}</RootDocument>;
}
async function RootDocument({children}:{children:React.ReactNode}){const [savedLanguage,requestHeaders]=await Promise.all([cookies(),headers()]);const routeLanguage=requestHeaders.get('x-xucuz-route-locale');const cookieLanguage=savedLanguage.get('xucuz_lang')?.value;const htmlLanguage=routeLanguage&&['tr','en','de','es'].includes(routeLanguage)?routeLanguage:cookieLanguage&&['tr','en','ru'].includes(cookieLanguage)?cookieLanguage:'tr';const appLanguage=htmlLanguage==='en'?'en':htmlLanguage==='ru'?'ru':'tr';
 return <html lang={htmlLanguage}><body><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9203233526232260" strategy="beforeInteractive" crossOrigin="anonymous"/><LanguageProvider initialLanguage={appLanguage}><PwaRegister/><div id="site-content">
  <a className="skip" href="#main">İçeriğe geç</a>
  {mode()==='demo'&&<div className="mode-bar"><span className="dot"/> Demo veriler — gerçek teklif değildir</div>}
  <WorldHeader/>
  <main id="main" tabIndex={-1}>{children}</main>
  <WorldFooter/>
 </div><LiveChat/><LiveQaRoute/><Analytics/><GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}/></LanguageProvider></body></html>;
}


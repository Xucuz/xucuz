export const dynamic='force-dynamic';
import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import Script from 'next/script';
import {Analytics} from '@vercel/analytics/next';
import {mode} from '@/lib/providers/engine';
import {LiveQA} from '@/components/live-qa';
import {LiveChat} from '@/components/live-chat';
import {LanguageProvider} from '@/components/language-provider';
import {PwaRegister} from '@/components/pwa-register';
import {WorldFooter,WorldHeader} from '@/components/world-shell';
import './xucuz-world.css';
import './globals.css';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Xucuz World — Explore with confidence',template:'%s | Xucuz World'},description:'A global discovery platform for verified prices, travel options, and your personal passport. No invented prices.',applicationName:'Xucuz World',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/xucina-icon-192.png',sizes:'192x192',type:'image/png'},{url:'/xucina-icon-512.png',sizes:'512x512',type:'image/png'}],apple:{url:'/xucina-icon-192.png',sizes:'192x192',type:'image/png'}},other:{'google-adsense-account':'ca-pub-9203233526232260'},openGraph:{type:'website',locale:'en_US',url:siteUrl,siteName:'Xucuz World',title:'Xucuz World — Explore with confidence',description:'Verified prices, travel discovery, and your own world passport.'},twitter:{card:'summary',title:'Xucuz World — Explore with confidence',description:'A global discovery platform that never invents prices.'},robots:mode()==='demo'?{index:false,follow:false}:{index:true,follow:true}};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <RootDocument>{children}</RootDocument>;
}
async function RootDocument({children}:{children:React.ReactNode}){const savedLanguage=(await cookies()).get('xucuz_lang')?.value;const language=savedLanguage==='en'||savedLanguage==='ru'?savedLanguage:'tr';
 return <html lang={language}><body><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9203233526232260" strategy="beforeInteractive" crossOrigin="anonymous"/><LanguageProvider initialLanguage={language}><PwaRegister/><div id="site-content">
  <a className="skip" href="#main">İçeriğe geç</a>
  {mode()==='demo'&&<div className="mode-bar"><span className="dot"/> Demo veriler — gerçek teklif değildir</div>}
  <WorldHeader/>
  <main id="main" tabIndex={-1}>{children}</main>
  <WorldFooter/>
 </div><LiveChat/><LiveQA/><Analytics/></LanguageProvider></body></html>;
}


export const dynamic='force-dynamic';
import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import Link from 'next/link';
import Script from 'next/script';
import {ArrowUpRight} from 'lucide-react';
import {Analytics} from '@vercel/analytics/next';
import {mode} from '@/lib/providers/engine';
import {Logo} from '@/components/logo';
import {LiveQA} from '@/components/live-qa';
import {LiveChat} from '@/components/live-chat';
import {LanguageProvider,LanguageSelect} from '@/components/language-provider';
import {PwaRegister} from '@/components/pwa-register';
import './globals.css';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Xucuz.com — Ücretsiz iş ortaklığı ve fiyat karşılaştırma ağı',template:'%s | xucuz'},description:'Mağazalar, yayıncılar, influencerlar ve ajanslar için ücretsiz iş ortaklığı ağı. Türkiye genelinde fiyat karşılaştırma ve alışveriş rehberleri.',applicationName:'Xucuz',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/xucina-icon-192.png',sizes:'192x192',type:'image/png'},{url:'/xucina-icon-512.png',sizes:'512x512',type:'image/png'}],apple:{url:'/xucina-icon-192.png',sizes:'192x192',type:'image/png'}},other:{'google-adsense-account':'ca-pub-9203233526232260'},openGraph:{type:'website',locale:'tr_TR',url:siteUrl,siteName:'Xucuz.com',title:'Xucuz.com — Ücretsiz iş ortaklığı ve fiyat karşılaştırma',description:'Mağazalar ve yayıncılar için hazırlanan ücretsiz iş ortaklığı ağı ve fiyat karşılaştırma rehberi.'},twitter:{card:'summary',title:'Xucuz.com — İş ortaklığı ve fiyat karşılaştırma',description:'Ücretsiz iş ortaklığı ağı ve Türkiye genelinde fiyat karşılaştırma rehberi.'},robots:mode()==='demo'?{index:false,follow:false}:{index:true,follow:true}};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <RootDocument>{children}</RootDocument>;
}
async function RootDocument({children}:{children:React.ReactNode}){const savedLanguage=(await cookies()).get('xucuz_lang')?.value;const language=savedLanguage==='en'||savedLanguage==='ru'?savedLanguage:'tr';
 return <html lang={language}><body><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9203233526232260" strategy="beforeInteractive" crossOrigin="anonymous"/><LanguageProvider initialLanguage={language}><PwaRegister/><div id="site-content">
  <a className="skip" href="#main">İçeriğe geç</a>
  {mode()==='demo'&&<div className="mode-bar"><span className="dot"/> Demo veriler — gerçek teklif değildir</div>}
  <header className="community-header wrap">
   <Link href="/" className="community-header-logo" aria-label="Xucuz.com ana sayfa"><Logo placement="header"/></Link>
   <nav aria-label="Ana menü"><Link href="/magazalar">Mağazalar</Link><Link href="/yayincilar">Yayıncılar</Link><Link href="/icerik-ureticileri">İçerik üreticileri</Link><Link href="/ajanslar">Ajanslar</Link><Link href="/fiyatlar">Fiyat karşılaştır</Link><LanguageSelect/></nav>
  </header>
  <main id="main" tabIndex={-1}>{children}</main>
  <footer><div className="wrap footer-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))"}}>
   <div><Link href="/" className="footer-brand-logo" aria-label="Xucuz.com ana sayfa"><Logo placement="footer"/></Link><p className="small">Ücretsiz iş ortaklığı ağı ve şeffaf fiyat karşılaştırma. Mevcut fiyat gözlemleri yönetici incelemesinden sonra yayımlanır.</p></div>
   <div><strong>İş ortaklığı ağı</strong><Link href="/magazalar">Mağazalar</Link><Link href="/yayincilar">Yayıncılar</Link><Link href="/icerik-ureticileri">İçerik üreticileri</Link><Link href="/ajanslar">Ajanslar</Link><Link href="/is-ortaklari">İş ortakları</Link><Link href="/kampanyalar">Kampanyalar</Link></div><div><strong>xucuz’u keşfet</strong><Link href="/fiyatlar">Fiyat ara</Link><Link href="/fiyat-ekle">Fiyat gözlemi paylaş</Link><Link href="/urun-sec">İhtiyacına göre ürün seç</Link><Link href="/rehberler">Alışveriş rehberleri</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim <ArrowUpRight size={13}/></Link><Link href="/affiliate">Affiliate ve sponsorlu içerik</Link></div>
   <div><strong>Bilgilendirme</strong><Link href="/gizlilik">Gizlilik ve çerezler</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link><Link href="/gecmis-fiyat">Geçmiş teklif kayıtları</Link><Link href="/birim-fiyat">Birim fiyat karşılaştır</Link><Link href="/indirim-hesapla">İndirim hesapla</Link><Link href="/taksit-mi-pesin-mi">Taksit ve peşin karşılaştır</Link></div>
  </div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Xucuz.com. Tüm hakları saklıdır.</span><span>Türkçe · Türkiye · TRY</span><span>Ödeme veya rezervasyon almayız.</span></div></footer>
 </div><LiveChat/><LiveQA/><Analytics/></LanguageProvider></body></html>;
}


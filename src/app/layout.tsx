export const dynamic='force-dynamic';
import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import {ArrowUpRight} from 'lucide-react';
import {Analytics} from '@vercel/analytics/next';
import {mode} from '@/lib/providers/engine';
import {Logo} from '@/components/logo';
import {LiveQA} from '@/components/live-qa';
import {LanguageProvider,LanguageSelect} from '@/components/language-provider';
import {PwaRegister} from '@/components/pwa-register';
import './globals.css';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Xucuz.com — Toplulukla güncel fiyat gözlemleri',template:'%s | xucuz'},description:'81 ilde ürün fiyatlarını ara, topluluk gözlemlerini karşılaştır ve fiş ya da raf etiketiyle katkıda bulun. Onaylanmayan fiyat gösterilmez.',applicationName:'Xucuz',manifest:'/manifest.webmanifest',other:{'google-adsense-account':'ca-pub-9203233526232260'},openGraph:{type:'website',locale:'tr_TR',url:siteUrl,siteName:'Xucuz.com',title:'Xucuz.com — Toplulukla güncel fiyat gözlemleri',description:'Türkiye genelinde fotoğrafla bildirilen ve incelenen fiyat gözlemleri.'},twitter:{card:'summary',title:'Xucuz.com — Topluluk fiyat rehberi',description:'Türkiye genelinde fotoğrafla bildirilen ve incelenen fiyat gözlemleri.'},robots:mode()==='demo'?{index:false,follow:false}:{index:true,follow:true}};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <RootDocument>{children}</RootDocument>;
}
async function RootDocument({children}:{children:React.ReactNode}){const savedLanguage=(await cookies()).get('xucuz_lang')?.value;const language=savedLanguage==='en'||savedLanguage==='ru'?savedLanguage:'tr';
 return <html lang={language}><body><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9203233526232260" strategy="beforeInteractive" crossOrigin="anonymous"/><LanguageProvider initialLanguage={language}><PwaRegister/><div id="site-content">
  <a className="skip" href="#main">İçeriğe geç</a>
  {mode()==='demo'&&<div className="mode-bar"><span className="dot"/> Demo veriler — gerçek teklif değildir</div>}
  <header className="community-header wrap">
   <Link href="/" className="community-header-logo" aria-label="Xucuz.com ana sayfa"><Image src="/xucina-brand.jpg" alt="" width={40} height={40} className="community-header-mascot"/><span className="community-header-x">x</span>ucuz<span className="community-wordmark-dot">.</span></Link>
   <nav aria-label="Ana menü"><Link href="/fiyatlar">Fiyat ara</Link><Link href="/fiyat-ekle">Fiyat bildir</Link><Link href="/rehberler">Rehberler</Link><Link href="/hakkimizda">Hakkımızda</Link><LanguageSelect/></nav>
  </header>
  <main id="main" tabIndex={-1}>{children}</main>
  <footer><div className="wrap footer-grid">
   <div><Link href="/" className="logo" aria-label="xucuz ana sayfa"><Logo/></Link><p>Etikete değil, gerçek gözleme bak.</p><p className="small">Topluluğun paylaştığı fiyatlar,<br/>yönetici incelemesinden sonra yayında.</p></div>
   <div><strong>xucuz’u keşfet</strong><Link href="/fiyatlar">Fiyat ara</Link><Link href="/fiyat-ekle">Fiyat gözlemi paylaş</Link><Link href="/urun-sec">İhtiyacına göre ürün seç</Link><Link href="/rehberler">Alışveriş rehberleri</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim <ArrowUpRight size={13}/></Link><Link href="/affiliate">Affiliate ve sponsorlu içerik</Link></div>
   <div><strong>Bilgilendirme</strong><Link href="/gizlilik">Gizlilik ve çerezler</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link><Link href="/gecmis-fiyat">Geçmiş teklif kayıtları</Link><Link href="/birim-fiyat">Birim fiyat karşılaştır</Link><Link href="/indirim-hesapla">İndirim hesapla</Link><Link href="/taksit-mi-pesin-mi">Taksit ve peşin karşılaştır</Link></div>
  </div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Xucuz.com. Tüm hakları saklıdır.</span><span>Türkçe · Türkiye · TRY</span><span>Ödeme veya rezervasyon almayız.</span></div></footer>
 </div><LiveQA/><Analytics/></LanguageProvider></body></html>;
}


export const dynamic='force-dynamic';
import type {Metadata} from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight,Calculator} from 'lucide-react';
import {Analytics} from '@vercel/analytics/next';
import {mode} from '@/lib/providers/engine';
import {BrandIntro} from '@/components/brand-intro';
import {Logo} from '@/components/logo';
import {TopBrandBanner} from '@/components/top-brand-banner';
import './globals.css';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??'https://xucuz.com';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Xucuz.com — Almadan önce gerçek maliyeti öğren',template:'%s | xucuz'},description:'İhtiyacına göre ürün seç, market alışverişinde birim fiyatı ve kampanya koşullarını karşılaştır. Kaynağı doğrulanmayan fiyatı teklif diye sunmayız.',applicationName:'Xucuz',openGraph:{type:'website',locale:'tr_TR',url:siteUrl,siteName:'Xucuz.com',title:'Xucuz.com — Almadan önce gerçek maliyeti öğren',description:'Ürün seçme rehberleri, birim fiyat hesapları ve bilinçli alışveriş araçları.'},twitter:{card:'summary',title:'Xucuz.com — Almadan önce gerçek maliyeti öğren',description:'Ürün seçme rehberleri, birim fiyat hesapları ve bilinçli alışveriş araçları.'},robots:mode()==='demo'?{index:false,follow:false}:{index:true,follow:true}};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="tr"><body><BrandIntro/><div id="site-content">
  <a className="skip" href="#main">İçeriğe geç</a>
  <TopBrandBanner/>
  {mode()==='demo'&&<div className="mode-bar"><span className="dot"/> Demo veriler — gerçek teklif değildir</div>}
  <header className="header wrap">
   <Link href="/" className="header-ad-slot header-genie-brand" aria-label="Xucuz.com ana sayfa"><span className="header-genie-mascot"><Image src="/xucuz-genie-mascot.png" alt="" width={1672} height={941} unoptimized/></span><Image className="header-genie-wordmark" src="/xucuz-wordmark.jpg" alt="Xucuz.com" width={856} height={178} unoptimized/></Link>
   <nav aria-label="Ana menü">
    <Link href="/market-rehberi" className="desktop-link">Market rehberi</Link>
    <Link href="/urun-sec" className="desktop-link">Ürün seç</Link>
    <Link href="/rehberler" className="desktop-link">Rehberler</Link>
    <Link href="/gecmis-fiyat" className="desktop-link">Geçmiş fiyat</Link>
    <Link href="/#araclar" className="favorite-link"><Calculator size={18}/><span>Araçlar</span></Link>
   </nav>
  </header>
  <main id="main" tabIndex={-1}>{children}</main>
  <footer><div className="wrap footer-grid">
   <div><Link href="/" className="logo" aria-label="xucuz ana sayfa"><Logo/></Link><p>Almadan önce gerçek maliyeti öğren.</p><p className="small">Kendi fiyatlarınla hesapla,<br/>alışverişini bilerek yap.</p></div>
   <div><strong>xucuz’u keşfet</strong><Link href="/market-rehberi">Haftalık market rehberi</Link><Link href="/urun-sec">İhtiyacına göre ürün seç</Link><Link href="/rehberler">Alışveriş rehberleri</Link><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim <ArrowUpRight size={13}/></Link><Link href="/affiliate">Affiliate ve sponsorlu içerik</Link></div>
   <div><strong>Bilgilendirme</strong><Link href="/gizlilik">Gizlilik ve çerezler</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link><Link href="/gecmis-fiyat">Geçmiş teklif kayıtları</Link><Link href="/birim-fiyat">Birim fiyat karşılaştır</Link><Link href="/indirim-hesapla">İndirim hesapla</Link><Link href="/taksit-mi-pesin-mi">Taksit ve peşin karşılaştır</Link></div>
  </div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Xucuz.com. Tüm hakları saklıdır.</span><span>Türkçe · Türkiye · TRY</span><span>Ödeme veya rezervasyon almayız.</span></div></footer>
 </div><Analytics/></body></html>;
}


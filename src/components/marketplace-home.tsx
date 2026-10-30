'use client';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight,Camera,MessageCircle,ShieldCheck,Store} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {CommunitySearchForm} from './community-search-form';
import {ProductSearch} from './product-search';
import {products} from '@/lib/products';

export function MarketplaceHome(){const {t}=useLanguage();return <div className="community-home">
 <div className="community-topline"><span>{t('system')}</span><LanguageSelect/></div>
 <section className="community-hero">
  <p className="community-kicker">{t('homeKicker')}</p>
  <h1>{t('intro')}</h1>
  <p className="community-lead">{t('lead')}</p>
  <div className="community-hero-feature">
   <div className="community-hero-search"><CommunitySearchForm/>
    <div className="community-shortcuts"><a href="#fiyat-bildir"><Camera size={16}/>{t('addPrice')}</a><Link href="/urunler"><Store size={16}/>{t('search')}</Link><Link href="/sohbet" style={{background:"#16a34a",color:"#fff",fontWeight:800,padding:"12px 16px",borderRadius:12,display:"inline-flex",alignItems:"center",gap:8}}><MessageCircle size={18}/>Canlı Sohbet</Link></div>
    <div className="community-trust"><ShieldCheck size={19}/><span>{t('honesty')}</span></div>
   </div>
   <Image src="/xucina-brand.jpg" alt="Xucina, Xucuz.com’un uzun koyu saçlı, esmer tenli, mavi ve altın kıyafetli resmi kadın cin maskotu." width={1280} height={853} priority sizes="(max-width: 700px) 100vw, 38vw" className="community-hero-mascot" />
  </div>
 </section>
 <section className="community-contribute" id="fiyat-bildir"><div className="community-contribute-icon"><Camera size={22}/></div><div><p className="community-kicker">{t('contributeKicker')}</p><h2>{t('contributeTitle')}</h2><p>{t('contributeBody')}</p></div><Link href="/fiyat-ekle" className="community-cta">{t('addPrice')}<ArrowRight size={17}/></Link></section>
 <section className="community-how" aria-label={t('howTitle')}><article><b>01</b><h3>{t('howFind')}</h3><p>{t('howFindBody')}</p></article><article><b>02</b><h3>{t('howProof')}</h3><p>{t('howProofBody')}</p></article><article><b>03</b><h3>{t('howCompare')}</h3><p>{t('howCompareBody')}</p></article></section>
 <section className="community-guide-search"><div><p className="community-kicker">ÜRÜNÜ TANIMLARKEN YARDIM</p><h2>Ürün rehberini de bul.</h2><p>Fiyat gözlemi yoksa ürün özelliklerini ve alışveriş kontrol listesini incele.</p></div><ProductSearch total={products.length}/></section>
</div>;}

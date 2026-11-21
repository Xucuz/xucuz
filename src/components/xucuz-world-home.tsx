'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight,Calculator,MapPinned,Search,ShieldCheck,Tag,Utensils} from 'lucide-react';
import {useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

export function XucuzWorldHome(){
 const {language}=useLanguage();
 const t=(key:Parameters<typeof worldText>[1])=>worldText(language,key);

 const portals=[
  {href:'/fiyatlar',label:'magicPriceTitle' as const,description:'magicPriceBody' as const,Icon:Tag,scene:'price'},
  {href:'/birim-fiyat',label:'magicBasketTitle' as const,description:'magicBasketBody' as const,Icon:Calculator,scene:'basket'},
  {href:'/passport',label:'magicDiscoveryTitle' as const,description:'magicDiscoveryBody' as const,Icon:MapPinned,scene:'discovery'}
 ];

 return <div className="magic-home">
  <section className="magic-stage" aria-labelledby="magic-title">
   <div className="magic-sky" aria-hidden="true"><span className="magic-moon"/><span className="magic-star magic-star-one"/><span className="magic-star magic-star-two"/><span className="magic-star magic-star-three"/><span className="magic-cityline"/><span className="magic-frame magic-frame-left"/><span className="magic-frame magic-frame-right"/></div>
   <div className="magic-stage-inner">
    <div className="magic-hero">
     <div className="magic-mascot-wrap">
      <span className="magic-mascot-halo" aria-hidden="true"/>
      <div className="magic-character-art">
       <Image className="magic-mascot" src="/xucuz-genie-globe.webp" alt={t('genieAlt')} width={745} height={1089} priority sizes="(max-width: 700px) 90vw, 38vw"/>
       <span className="magic-spinning-globe" aria-hidden="true"/>
      </div>
      <span className="magic-mascot-spark magic-spark-a" aria-hidden="true">✦</span><span className="magic-mascot-spark magic-spark-b" aria-hidden="true">✧</span>

     </div>
     <div className="magic-copy">
      <p className="magic-kicker"><span className="magic-kicker-gem"/> {t('magicKicker')}</p>
      <h1 id="magic-title"><span>{t('magicTitleFirst')}</span><em>{t('magicTitleSecond')}</em></h1>
      <p className="magic-lead">{t('magicLead')}</p>
      <form className="magic-search" action="/xucuz-ai">
       <Search size={21} aria-hidden="true"/><label htmlFor="magic-search-input" className="sr-only">{t('searchLabel')}</label>
       <input id="magic-search-input" name="q" placeholder={t('magicSearchPlaceholder')} autoComplete="off"/>
       <button type="submit">{t('magicSearchButton')}<ArrowRight size={17}/></button>
      </form>
      <p className="magic-search-note"><ShieldCheck size={15}/>{t('magicSearchNote')}</p>
     </div>
    </div>

    <nav className="magic-portals" aria-label={t('magicPortalsLabel')}>
     {portals.map(({href,label,description,Icon,scene},index)=><Link className={`magic-portal magic-portal-${scene}`} href={href} key={scene}>
      <span className="magic-portal-number">0{index+1}</span>
      <span className="magic-portal-art" aria-hidden="true"><span className="magic-portal-rune"/><span className="magic-portal-icon"><Icon size={48} strokeWidth={1.45}/></span>{scene==='basket'&&<span className="magic-portal-subicon"><Calculator size={24}/></span>}{scene==='discovery'&&<span className="magic-portal-subicon"><Utensils size={22}/></span>}</span>
      <span className="magic-portal-title">{t(label)}</span><span className="magic-portal-description">{t(description)}</span><span className="magic-portal-arrow"><ArrowRight size={17}/></span>
     </Link>)}
    </nav>

    <div className="magic-trust-strip"><span><ShieldCheck size={20}/>{t('magicTrustNoGuess')}</span><i aria-hidden="true"/><span><Search size={19}/>{t('magicTrustSource')}</span></div>
   </div>
  </section>
  <section className="magic-afterword" aria-label={t('dataTitle')}><p>{t('magicAfterword')}</p><Link href="/veri-kaynaklari">{t('verified')}<ArrowRight size={14}/></Link></section>
 </div>;
}

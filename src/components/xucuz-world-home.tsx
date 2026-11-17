'use client';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowDownRight,ArrowRight,ArrowUpRight,Compass,Globe2,LockKeyhole,MapPinned,Plane,Radio,Search,ShieldCheck,Sparkles,Store,WalletCards} from 'lucide-react';
import {useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

export function XucuzWorldHome(){
 const {language}=useLanguage();const t=(key:Parameters<typeof worldText>[1])=>worldText(language,key);
 const modules=[
  {id:'xucuz-ai',href:'/xucuz-ai',key:'aiTitle' as const,body:'aiBody' as const,status:'aiStatus' as const,Icon:Sparkles,tone:'blue'},
  {id:'passport',href:'/passport',key:'passportTitle' as const,body:'passportBody' as const,status:'passportStatus' as const,Icon:MapPinned,tone:'gold'},
  {id:'travel',href:'/#travel',key:'travelTitle' as const,body:'travelBody' as const,status:'travelStatus' as const,Icon:Plane,tone:'sky'},
  {id:'market',href:'/fiyatlar',key:'marketTitle' as const,body:'marketBody' as const,status:'marketStatus' as const,Icon:WalletCards,tone:'violet'},
  {id:'business',href:'/magazalar',key:'businessTitle' as const,body:'businessBody' as const,status:'businessStatus' as const,Icon:Store,tone:'mint'},
  {id:'radar',href:'/#radar',key:'radarTitle' as const,body:'radarBody' as const,status:'radarStatus' as const,Icon:Radio,tone:'coral'}
 ];
 return <div className="world-home">
  <section className="world-hero" aria-labelledby="world-title">
   <div className="world-hero-grid" aria-hidden="true"/>
   <div className="world-hero-copy"><p className="world-eyebrow"><span/>{t('eyebrow')}</p><h1 id="world-title">{t('heroTitle')}</h1><p className="world-hero-lead">{t('heroLead')}</p>
    <form className="world-search" action="/fiyatlar"><Search size={19}/><label htmlFor="world-search" className="sr-only">{t('searchLabel')}</label><input id="world-search" name="q" placeholder={t('searchPlaceholder')} autoComplete="off"/><button type="submit">{t('searchButton')}<ArrowRight size={16}/></button></form>
    <p className="world-search-note"><ShieldCheck size={14}/>{t('priceScope')}</p>
    <div className="world-hero-actions"><Link className="world-button-primary" href="/xucuz-ai"><Sparkles size={17}/>{t('askAi')}<ArrowUpRight size={16}/></Link><Link className="world-button-quiet" href="/passport"><Compass size={17}/>{t('openPassport')}</Link></div>
   </div>
   <Link href="/xucuz-ai" className="world-genie-showcase" aria-label={t('ai')}>
    <span className="world-orbit world-orbit-one"/><span className="world-orbit world-orbit-two"/>
    <span className="world-genie-glow"/><Image className="world-genie-image" src="/xucuz-world-genie.webp" alt={t('genieAlt')} width={630} height={630} priority sizes="(max-width:640px) 80vw, 35vw"/>
    <span className="world-genie-caption"><Sparkles size={13}/>{t('ai')}</span>
   </Link>
   <div className="world-hero-bottom"><span><Globe2 size={14}/>XUCUZ WORLD</span><span>TR <i/> EN <i/> RU</span><a href="#world-modules">{t('modulesTitle')}<ArrowDownRight size={15}/></a></div>
  </section>

  <section className="world-principles" aria-label={t('dataTitle')}>
   {[['sourceLabel','sourceBody',LockKeyhole],['currencyLabel','currencyBody',WalletCards],['noInvented','noInventedBody',ShieldCheck]].map(([title,body,Icon])=>{
    const ItemIcon=Icon as typeof LockKeyhole;return <article key={title as string}><span className="world-principle-icon"><ItemIcon size={18}/></span><div><strong>{t(title as Parameters<typeof worldText>[1])}</strong><p>{t(body as Parameters<typeof worldText>[1])}</p></div></article>;
   })}
  </section>

  <section className="world-modules-section" id="world-modules" aria-labelledby="world-modules-title">
   <div className="world-section-heading"><div><p className="world-eyebrow"><span/>{t('home')}</p><h2 id="world-modules-title">{t('modulesTitle')}</h2><p>{t('modulesLead')}</p></div><span className="world-section-index">01 / 06</span></div>
   <div className="world-module-grid">{modules.map(({id,href,key,body,status,Icon,tone},index)=><Link href={href} id={id} key={id} className={`world-module-card tone-${tone}`}>
    <span className="world-module-top"><span className="world-module-icon"><Icon size={20}/></span><span>0{index+1}</span></span>
    <h3>{t(key)}</h3><p>{t(body)}</p><span className="world-module-status"><i/>{t(status)}</span><span className="world-module-arrow"><ArrowUpRight size={18}/></span>
   </Link>)}</div>
  </section>

  <section className="world-passport-band" aria-labelledby="world-passport-title">
   <div className="world-passport-copy"><p className="world-eyebrow"><span/>XUCUZ PASSPORT</p><h2 id="world-passport-title">{t('passportTitle')}</h2><p>{t('passportBody')}</p><Link className="world-button-primary" href="/passport">{t('openPassport')}<ArrowRight size={16}/></Link><small>{t('localNote')}</small></div>
  <Link href="/passport" className="world-atlas-card" aria-label={t('mapTitle')}><span className="world-atlas-head"><span><MapPinned size={15}/>{t('mapTitle')}</span><ArrowUpRight size={16}/></span><span className="world-atlas-image"><Image src="/world-atlas.svg" alt="" width={1200} height={600} sizes="(max-width: 640px) 90vw, 55vw" loading="lazy"/></span><span className="world-atlas-foot"><i/> PERSONAL DISCOVERY MAP <span>PUBLIC-DOMAIN BASE MAP</span></span></Link>
  </section>

  <section className="world-trust-section" aria-labelledby="world-trust-title"><div className="world-trust-icon"><ShieldCheck size={24}/></div><div><p className="world-eyebrow"><span/>XUCUZ DATA STANDARD</p><h2 id="world-trust-title">{t('dataTitle')}</h2><p>{t('dataLead')}</p></div><Link href="/veri-kaynaklari">{t('verified')}<ArrowRight size={15}/></Link></section>
 </div>;
}

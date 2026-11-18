'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowRight,Calculator,MapPinned,Mic,MicOff,Search,ShieldCheck,Sparkles,Tag,Utensils} from 'lucide-react';
import {useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

export function XucuzWorldHome(){
 const {language}=useLanguage();
 const t=(key:Parameters<typeof worldText>[1])=>worldText(language,key);
 const [speaking,setSpeaking]=useState(false);
 const [voiceNotice,setVoiceNotice]=useState('');
 const speak=()=>{
  if(typeof window==='undefined'||!('speechSynthesis' in window)){setVoiceNotice(t('magicVoiceUnsupported'));return;}
  const synth=window.speechSynthesis;
  if(speaking){synth.cancel();setSpeaking(false);return;}
  synth.cancel();
  const utterance=new SpeechSynthesisUtterance(`${t('magicTitleFirst')} ${t('magicTitleSecond')}. ${t('magicLead')} ${t('magicVoiceLine')}`);
  utterance.lang=language==='en'?'en-US':language==='ru'?'ru-RU':'tr-TR';
  utterance.rate=.96;
  utterance.pitch=1.04;
  utterance.onend=()=>setSpeaking(false);
  utterance.onerror=()=>{setSpeaking(false);setVoiceNotice(t('magicVoiceUnsupported'));};
  setVoiceNotice('');setSpeaking(true);synth.speak(utterance);
 };

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
      <Image className="magic-mascot" src="/xucuz-world-genie.webp" alt={t('genieAlt')} width={630} height={630} priority sizes="(max-width: 700px) 82vw, 38vw"/>
      <span className="magic-world-orbit" aria-hidden="true">
       <span className="magic-world-orbit-ring"/>
       <span className="magic-world-globe">
        <svg viewBox="0 0 180 180" focusable="false">
         <defs>
          <radialGradient id="magic-world-ocean" cx="35%" cy="28%"><stop offset="0" stopColor="#49e7ff"/><stop offset=".52" stopColor="#087dc7"/><stop offset="1" stopColor="#08245d"/></radialGradient>
          <clipPath id="magic-world-clip"><circle cx="90" cy="90" r="65"/></clipPath>
         </defs>
         <circle cx="90" cy="90" r="67" fill="url(#magic-world-ocean)" stroke="#a9f4ff" strokeWidth="2"/>
         <g clipPath="url(#magic-world-clip)">
          <g className="magic-world-land">
           <path d="M26 49l10-11 14 2 5 7 12 2 6 8-7 6-2 11-9 2-4 11-8-3-3-10-9-7-8-2-3-9 5-7zM59 87l10 2 7 12-3 15-7 14-7 19-8-5 1-15-5-13 3-14zM84 47l10-7 11 2 3 7 13-2 14 7 12-1 10 8-2 8-14 1-6 8-11-2-9 7-8-5-7 7-8-4-6-11-9-4-3-10 6-6zM96 79l12 2 8 11-3 12-6 8-3 16-7 9-7-7-2-14-7-10 3-13-1-9 6-5zM134 116l12-3 11 6-4 9-13 4-9-6z" fill="#5cf2b2" stroke="#9cffe0" strokeWidth="1.2"/>
          </g>
          <ellipse cx="90" cy="90" rx="31" ry="65" fill="none" stroke="#a8efff" strokeOpacity=".58" strokeWidth="2"/>
          <ellipse cx="90" cy="90" rx="55" ry="65" fill="none" stroke="#a8efff" strokeOpacity=".33" strokeWidth="1.5"/>
          <path d="M25 90h130M35 62h110M35 118h110" fill="none" stroke="#a8efff" strokeOpacity=".35" strokeWidth="1.5"/>
         </g>
         <circle cx="90" cy="90" r="67" fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="1"/>
        </svg>
       </span>
       <span className="magic-world-spark magic-world-spark-one">✦</span><span className="magic-world-spark magic-world-spark-two">✧</span>
      </span>
      <span className="magic-mascot-spark magic-spark-a" aria-hidden="true">✦</span><span className="magic-mascot-spark magic-spark-b" aria-hidden="true">✧</span>
      <div className="magic-mascot-actions">
       <button type="button" className="magic-voice-button" onClick={speak} aria-pressed={speaking}>
        {speaking?<MicOff size={17}/>:<Mic size={17}/>}<span>{speaking?t('magicVoiceStop'):t('magicVoiceButton')}</span>
       </button>
       {voiceNotice&&<span className="magic-voice-notice" role="status">{voiceNotice}</span>}
       <Link className="magic-ask-link" href="/xucuz-ai"><Sparkles size={14}/>{t('askAi')}</Link>
      </div>
     </div>
     <div className="magic-copy">
      <p className="magic-kicker"><span className="magic-kicker-gem"/> {t('magicKicker')}</p>
      <h1 id="magic-title"><span>{t('magicTitleFirst')}</span><em>{t('magicTitleSecond')}</em></h1>
      <p className="magic-lead">{t('magicLead')}</p>
      <form className="magic-search" action="/fiyatlar">
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

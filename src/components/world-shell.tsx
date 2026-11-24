'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Lamp,Store,Wrench,Radio} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {worldText,type WorldCopyKey} from '@/lib/xucuz-world-copy';

const nav=[
 {href:'/',key:'magicNavShop',label:undefined,Icon:Store},
 {href:'/canli-maclar',key:'liveMatches',label:undefined,Icon:Radio},
 {href:'/xucuz-usta',key:'xucuzUsta',label:'Usta İşçilik',Icon:Wrench},
] as const;
const ustaLabels={tr:'Usta İşçilik',en:'Home Services',de:'Handwerksdienste',es:'Servicios para el hogar',ru:'Домашние мастера',fr:'Services à domicile',ar:'خدمات المنازل',zh:'家居服务'} as const;
const sportLabels={tr:'Canlı maçlar',en:'Live matches',de:'Live-Spiele',es:'Partidos en vivo',ru:'Матчи в прямом эфире',fr:'Matchs en direct',ar:'المباريات المباشرة',zh:'赛事直播'} as const;

export function WorldHeader(){
 const {language}=useLanguage();
 return <header className="world-header">
  <div className="world-header-inner">
   <Link href="/" className="world-brand" aria-label="Xucuz ana sayfa"><span className="world-brand-symbol"><Lamp size={22}/></span><span className="world-brand-name">XUCUZ<span>WORLD</span></span></Link>
   <nav className="world-nav" aria-label="Xucuz">
    {nav.map(({href,key,Icon,label},index)=><Link href={href} key={key} className={`world-nav-link ${index===0?'world-home-link':''} ${key==='xucuzUsta'?'world-nav-usta':''}`}><Icon size={16}/><span>{key==='xucuzUsta'?ustaLabels[language]:key==='liveMatches'?sportLabels[language]:label??worldText(language,key as WorldCopyKey)}</span></Link>)}
   </nav>
   <div className="world-controls"><LanguageSelect/></div>
  </div>
 </header>;
}

export function WorldFooter(){
 const pathname=usePathname();
 const {language}=useLanguage();
 if(pathname==='/')return null;
 return <footer className="world-footer"><div className="world-footer-inner world-footer-compact">
  <nav aria-label="Information"><Link href="/fiyatlar">{worldText(language,'verified')}</Link><Link href="/magazalar">{worldText(language,'business')}</Link><Link href="/gizlilik">Privacy</Link><Link href="/kullanim-kosullari">Terms</Link></nav>
  <div className="world-footer-bottom">© {new Date().getFullYear()} Xucuz · Sources first, no invented prices.</div>
 </div></footer>;
}

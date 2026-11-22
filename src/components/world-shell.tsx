'use client';
import Link from 'next/link';
import {Lamp,MapPinned,Search,ShoppingBasket,Store,Goal} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

const nav=[
 {href:'/',key:'magicNavShop',Icon:Store},
 {href:'/fiyatlar',key:'magicNavPrice',Icon:Search},
 {href:'/birim-fiyat',key:'magicNavBasket',Icon:ShoppingBasket},
 {href:'/canli-maclar',key:'liveMatches',Icon:Goal},
 {href:'/passport',key:'magicNavDiscover',Icon:MapPinned}
] as const;

export function WorldHeader(){
 const {language}=useLanguage();
 return <header className="world-header">
  <div className="world-header-inner">
   <Link href="/" className="world-brand" aria-label="Xucuz ana sayfa"><span className="world-brand-symbol"><Lamp size={22}/></span><span className="world-brand-name">XUCUZ<span>WORLD</span></span></Link>
   <nav className="world-nav" aria-label="Xucuz">
    {nav.map(({href,key,Icon},index)=><Link href={href} key={key} className={`world-nav-link ${index===0?'world-home-link':''}`}><Icon size={16}/><span>{key==='liveMatches'?(language==='en'?'Live matches':language==='ru'?'Матчи в эфире':'Canlı maçlar'):worldText(language,key)}</span></Link>)}
   </nav>
   <div className="world-controls"><LanguageSelect/></div>
  </div>
 </header>;
}

export function WorldFooter(){
 const {language}=useLanguage();
 return <footer className="world-footer"><div className="world-footer-inner world-footer-compact">
  <nav aria-label="Information"><Link href="/fiyatlar">{worldText(language,'verified')}</Link><Link href="/magazalar">{worldText(language,'business')}</Link><Link href="/gizlilik">Privacy</Link><Link href="/kullanim-kosullari">Terms</Link></nav>
  <div className="world-footer-bottom">© {new Date().getFullYear()} Xucuz · Sources first, no invented prices.</div>
 </div></footer>;
}

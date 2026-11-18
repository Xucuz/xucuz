'use client';
import Link from 'next/link';
import {Lamp,MapPinned,Search,ShoppingBasket,Store} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

const nav=[
 {href:'/',key:'magicNavShop',Icon:Store},
 {href:'/fiyatlar',key:'magicNavPrice',Icon:Search},
 {href:'/birim-fiyat',key:'magicNavBasket',Icon:ShoppingBasket},
 {href:'/passport',key:'magicNavDiscover',Icon:MapPinned}
] as const;

export function WorldHeader(){
 const {language}=useLanguage();
 return <header className="world-header">
  <div className="world-header-inner">
   <Link href="/" className="world-brand" aria-label="Xucuz ana sayfa"><span className="world-brand-symbol"><Lamp size={22}/></span><span className="world-brand-name">XUCUZ<span>WORLD</span></span></Link>
   <nav className="world-nav" aria-label="Xucuz">
    {nav.map(({href,key,Icon},index)=><Link href={href} key={key} className={`world-nav-link ${index===0?'world-home-link':''}`}><Icon size={16}/><span>{worldText(language,key)}</span></Link>)}
   </nav>
   <div className="world-controls"><LanguageSelect/><Link href="/xucuz-ai" className="world-header-ask">{worldText(language,'askAi')}</Link></div>
  </div>
 </header>;
}

export function WorldFooter(){
 const {language}=useLanguage();
 return <footer className="world-footer"><div className="world-footer-inner">
  <div><Link href="/" className="world-footer-brand">XUCUZ<span>WORLD</span></Link><p>{worldText(language,'dataLead')}</p></div>
  <nav aria-label="Explore"><Link href="/xucuz-ai">{worldText(language,'ai')}</Link><Link href="/passport">{worldText(language,'passport')}</Link><Link href="/#travel">{worldText(language,'travel')}</Link><Link href="/#market">{worldText(language,'market')}</Link></nav>
  <nav aria-label="Information"><Link href="/fiyatlar">{worldText(language,'verified')}</Link><Link href="/magazalar">{worldText(language,'business')}</Link><Link href="/gizlilik">Privacy</Link><Link href="/kullanim-kosullari">Terms</Link></nav>
 </div><div className="world-footer-bottom">© {new Date().getFullYear()} Xucuz World · Sources first, no invented prices.</div></footer>;
}

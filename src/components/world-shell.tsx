'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Compass,Globe2,Lamp,Map,Plane,Radio,ShoppingBasket,Sparkles,Store} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

const nav=[
 {href:'/',key:'home',Icon:Globe2},
 {href:'/xucuz-ai',key:'ai',Icon:Sparkles},
 {href:'/passport',key:'passport',Icon:Map},
 {href:'/#travel',key:'travel',Icon:Plane},
 {href:'/#market',key:'market',Icon:ShoppingBasket},
 {href:'/#business',key:'business',Icon:Store},
 {href:'/#radar',key:'radar',Icon:Radio}
] as const;
const currencies=['TRY','USD','EUR','GBP'] as const;
type Currency=typeof currencies[number];

export function WorldHeader(){
 const {language}=useLanguage();const [currency,setCurrency]=useState<Currency>('TRY');
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const value=localStorage.getItem('xucuz-world-currency');if(currencies.includes(value as Currency))setCurrency(value as Currency);});return()=>cancelAnimationFrame(frame);},[]);
 return <header className="world-header">
  <Link href="/" className="world-brand" aria-label="Xucuz World home"><span className="world-brand-symbol"><Lamp size={22}/></span><span className="world-brand-name">XUCUZ<span>WORLD</span></span></Link>
  <nav className="world-nav" aria-label="Xucuz World">
   {nav.map(({href,key,Icon})=><Link href={href} key={key} className={`world-nav-link ${key==='home'?'world-home-link':''}`}><Icon size={16}/><span>{worldText(language,key)}</span></Link>)}
  </nav>
  <div className="world-controls">
   <label className="world-select-label"><span className="sr-only">{worldText(language,'currency')}</span><select aria-label={worldText(language,'currency')} value={currency} onChange={event=>{const next=event.target.value as Currency;setCurrency(next);localStorage.setItem('xucuz-world-currency',next);}}>{currencies.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
   <LanguageSelect/>
   <Link href="/passport" className="world-passport-quick"><Compass size={15}/><span>{worldText(language,'passport')}</span></Link>
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

'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Lamp,Store,Wrench} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {worldText,type WorldCopyKey} from '@/lib/xucuz-world-copy';

const nav=[
 {href:'/',key:'magicNavShop',label:undefined,Icon:Store},
 {href:'/xucuz-usta',key:'xucuzUsta',label:'Xucuz Usta',Icon:Wrench},
] as const;

export function WorldHeader(){
 const pathname=usePathname();
 const {language}=useLanguage();
 if(pathname==='/')return null;
 return <header className="world-header">
  <div className="world-header-inner">
   <Link href="/" className="world-brand" aria-label="Xucuz ana sayfa"><span className="world-brand-symbol"><Lamp size={22}/></span><span className="world-brand-name">XUCUZ<span>WORLD</span></span></Link>
   <nav className="world-nav" aria-label="Xucuz">
    {nav.map(({href,key,Icon,label},index)=><Link href={href} key={key} className={`world-nav-link ${index===0?'world-home-link':''} ${key==='xucuzUsta'?'world-nav-usta':''}`}><Icon size={16}/><span>{label??worldText(language,key as WorldCopyKey)}</span></Link>)}
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

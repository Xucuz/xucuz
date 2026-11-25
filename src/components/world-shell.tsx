'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Lamp} from 'lucide-react';
import {LanguageSelect,useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

export function WorldHeader(){
 return <header className="world-header">
  <div className="world-header-inner">
   <Link href="/" className="world-brand" aria-label="Xucuz ana sayfa"><span className="world-brand-symbol"><Lamp size={22}/></span><span className="world-brand-name">XUCUZ<span>WORLD</span></span></Link>
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

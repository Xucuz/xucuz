'use client';
import Image from 'next/image';
import {useLayoutEffect,useRef} from 'react';
const storageKey='xucuz-brand-intro-v1';
export function BrandIntro(){const overlay=useRef<HTMLDivElement>(null);const skip=useRef<HTMLButtonElement>(null);const close=useRef<()=>void>(()=>{});
 useLayoutEffect(()=>{const element=overlay.current;if(!element)return;try{if(sessionStorage.getItem(storageKey)==='shown'){element.hidden=true;return;}}catch{/* Storage restrictions must not prevent the site opening. */}
 if(getComputedStyle(element).visibility==='hidden'){element.hidden=true;try{sessionStorage.setItem(storageKey,'shown');}catch{}return;}element.hidden=false;element.style.animation='none';const content=document.getElementById('site-content');const previousFocus=document.activeElement;const previousOverflow=document.body.style.overflow;const previousInert=content?.inert??false;document.body.style.overflow='hidden';if(content)content.inert=true;skip.current?.focus({preventScroll:true});const started=performance.now();let closed=false;const timer=setTimeout(()=>finish(),3000);
 function finish(markSeen=true){if(closed)return;closed=true;if(markSeen){try{sessionStorage.setItem(storageKey,'shown');}catch{}}clearTimeout(timer);element!.hidden=true;document.body.style.overflow=previousOverflow;if(content)content.inert=previousInert;document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);const target=previousFocus instanceof HTMLElement&&previousFocus!==document.body&&!element!.contains(previousFocus)&&previousFocus.isConnected?previousFocus:document.getElementById('main');target?.focus({preventScroll:true});}
 function onKey(event:KeyboardEvent){if(event.key==='Escape'){event.preventDefault();finish();}else if(event.key==='Tab'){event.preventDefault();skip.current?.focus({preventScroll:true});}}
 function onVisibility(){if(document.visibilityState==='visible'&&performance.now()-started>=3000)finish();}
 close.current=finish;document.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onVisibility);return ()=>finish(false);
 },[]);
 return <div ref={overlay} className="brand-intro" role="dialog" aria-modal="true" aria-label="Xucuz açılış ekranı"><div className="intro-lockup"><Image src="/xucuz-logo.svg" alt="Xucuz.com siyah X logosu" width={280} height={280} priority unoptimized/><p>Etikete değil gerçek maliyete bak</p></div><button ref={skip} type="button" className="intro-skip" onClick={()=>close.current()}>Siteye geç →</button></div>;
}

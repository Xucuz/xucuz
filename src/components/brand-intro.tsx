'use client';
import {useLayoutEffect,useRef} from 'react';

const storageKey='xucuz-brand-intro-v2';

export function BrandIntro(){
 const overlay=useRef<HTMLDivElement>(null);
 const video=useRef<HTMLVideoElement>(null);
 const finish=useRef<()=>void>(()=>{});

 useLayoutEffect(()=>{
  const element=overlay.current;
  const player=video.current;
  if(!element||!player)return;
  try{if(sessionStorage.getItem(storageKey)==='shown'){element.hidden=true;return;}}catch{/* Storage restrictions must not prevent the site opening. */}

  element.hidden=false;
  const content=document.getElementById('site-content');
  const previousFocus=document.activeElement;
  const previousOverflow=document.body.style.overflow;
  const previousInert=content?.inert??false;
  document.body.style.overflow='hidden';
  if(content)content.inert=true;
  let closed=false;
  const timer=window.setTimeout(()=>close(),18000);

  function close(){
   if(closed)return;
   closed=true;
   try{sessionStorage.setItem(storageKey,'shown');}catch{}
   window.clearTimeout(timer);
   element!.hidden=true;
   document.body.style.overflow=previousOverflow;
   if(content)content.inert=previousInert;
   document.removeEventListener('keydown',onKey);
   const target=previousFocus instanceof HTMLElement&&previousFocus!==document.body&&!element!.contains(previousFocus)&&previousFocus.isConnected?previousFocus:document.getElementById('main');
   target?.focus({preventScroll:true});
  }
  function onKey(event:KeyboardEvent){if(event.key==='Escape'){event.preventDefault();close();}}
  finish.current=close;
  document.addEventListener('keydown',onKey);
  player.focus({preventScroll:true});
  void player.play().catch(()=>close());
  return ()=>{
   window.clearTimeout(timer);
   document.removeEventListener('keydown',onKey);
   if(!closed){closed=true;player.pause();element.hidden=true;document.body.style.overflow=previousOverflow;if(content)content.inert=previousInert;}
  };
 },[]);

 return <div ref={overlay} className="brand-intro" role="dialog" aria-modal="true" aria-label="Xucuz karşılama videosu" hidden>
  <video ref={video} className="brand-intro-video" autoPlay muted playsInline controls preload="auto" poster="/welcome-genie-poster.jpg" aria-label="Xucuz.com karşılama videosu. Video bitince site açılır." onEnded={()=>finish.current()} onError={()=>finish.current()}>
   <source src="/welcome-genie.mp4" type="video/mp4"/>
   Tarayıcınız video oynatmayı desteklemiyor.
  </video>
 </div>;
}

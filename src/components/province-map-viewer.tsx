'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {MapPinned, X} from 'lucide-react';
import {useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

export function ProvinceMapViewer(){
 const {language}=useLanguage();
 const [open,setOpen]=useState(false);
 const t=(key:Parameters<typeof worldText>[1])=>worldText(language,key);

 useEffect(()=>{
  if(!open)return;
  const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
  document.addEventListener('keydown',onKeyDown);
  document.body.style.overflow='hidden';
  return ()=>{document.removeEventListener('keydown',onKeyDown);document.body.style.overflow='';};
 },[open]);

 return <>
  <button type="button" className="magic-map-button" onClick={()=>setOpen(true)}>
   <MapPinned size={15} aria-hidden="true"/>{t('provinceMapButton')}
  </button>
  {open&&<div className="province-map-backdrop" role="presentation" onClick={()=>setOpen(false)}>
   <section className="province-map-dialog" role="dialog" aria-modal="true" aria-labelledby="province-map-title" onClick={event=>event.stopPropagation()}>
    <header className="province-map-dialog-head">
     <div><p>{t('provinceMapEyebrow')}</p><h2 id="province-map-title">{t('provinceMapTitle')}</h2></div>
     <button type="button" onClick={()=>setOpen(false)} aria-label={t('provinceMapClose')}><X size={20}/></button>
    </header>
    <p className="province-map-hint">{t('provinceMapHint')}</p>
    <div className="province-map-viewport">
     <Image src="/turkiye-81-il-labels.svg" alt={t('provinceMapAlt')} width={1440} height={640} unoptimized priority/>
    </div>
    <p className="province-map-credit">© OpenStreetMap contributors · geoBoundaries (CC BY-SA 2.0)</p>
   </section>
  </div>}
 </>;
}

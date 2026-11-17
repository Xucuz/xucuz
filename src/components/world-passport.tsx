'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Check,MapPin,Search,Stamp} from 'lucide-react';
import {useLanguage} from './language-provider';
import {destinations,exploredCountryCount,passportStorageKey,sanitizePassportStamps,Destination} from '@/lib/passport-data';
import {worldText,WorldCopyKey} from '@/lib/xucuz-world-copy';

const countryOrder=['tr','jp','it','gb','fr','de','ae','us','ruCountry'] as const;

export function WorldPassport(){
 const {language}=useLanguage();const t=(key:WorldCopyKey)=>worldText(language,key);
 const [stamps,setStamps]=useState<string[]>([]);const [loaded,setLoaded]=useState(false);const [activeCountry,setActiveCountry]=useState<string>('tr');const [selectedId,setSelectedId]=useState('tr-istanbul');const [query,setQuery]=useState('');
 useEffect(()=>{const frame=requestAnimationFrame(()=>{try{setStamps(sanitizePassportStamps(JSON.parse(localStorage.getItem(passportStorageKey)??'[]')));}catch{setStamps([]);}setLoaded(true);});return()=>cancelAnimationFrame(frame);},[]);
 useEffect(()=>{if(loaded)localStorage.setItem(passportStorageKey,JSON.stringify(stamps));},[loaded,stamps]);
 const search=query.trim().toLocaleLowerCase(language==='tr'?'tr-TR':language==='ru'?'ru-RU':'en-GB');
 const visibleCountries=countryOrder.filter(country=>!search||t(country as WorldCopyKey).toLocaleLowerCase().includes(search)||destinations.some(place=>place.country===country&&t(place.city as WorldCopyKey).toLocaleLowerCase().includes(search)));
 const selectedCountry=visibleCountries.includes(activeCountry as typeof visibleCountries[number])?activeCountry:visibleCountries[0]??'tr';
 const visiblePlaces=destinations.filter(place=>place.country===selectedCountry&&(!search||t(place.city as WorldCopyKey).toLocaleLowerCase().includes(search)));
 const selected=destinations.find(place=>place.id===selectedId)??visiblePlaces[0]??destinations[0];
 const toggled=stamps.includes(selected.id);
 function toggleStamp(place:Destination){setStamps(current=>current.includes(place.id)?current.filter(id=>id!==place.id):[...current,place.id]);}
 return <div className="world-passport-page">
  <div className="world-passport-heading"><Link href="/" className="world-back-link"><ArrowLeft size={15}/>{t('backHome')}</Link><p className="world-eyebrow"><span/>XUCUZ PASSPORT · PERSONAL DISCOVERY</p><h1>{t('passportPageTitle')}</h1><p>{t('passportLead')}</p></div>
  <section className="world-passport-overview" aria-label={t('passportTitle')}>
   <div className="world-passport-overview-copy"><span className="world-passport-mark"><Stamp size={22}/></span><div><small>XUCUZ WORLD · PASSPORT</small><strong>{t('passportTitle')}</strong><span>{t('localNote')}</span></div></div>
   <div className="world-passport-stats"><div><strong>{stamps.length}</strong><span>{t('passportCount')}</span></div><div><strong>{exploredCountryCount(stamps)}</strong><span>{t('countryCount')}</span></div></div>
  </section>
  <section className="world-passport-map-section" aria-labelledby="passport-map-title">
   <div className="world-section-heading"><div><p className="world-eyebrow"><span/>ATLAS · 01</p><h2 id="passport-map-title">{t('mapTitle')}</h2><p>{t('mapNote')}</p></div><span className="world-atlas-legend"><i/>{stamps.length} {t('stamped')}</span></div>
   <div className="passport-map">
    <Image src="/world-atlas.svg" alt="" fill priority sizes="(max-width:700px) 100vw, 70vw" unoptimized className="passport-map-base"/>
    {destinations.map(place=>{const marked=stamps.includes(place.id);return <button key={place.id} type="button" className={`passport-map-pin ${marked?'marked':''} ${place.id===selectedId?'selected':''}`} style={{left:`${((place.lon+180)/360)*100}%`,top:`${((90-place.lat)/180)*100}%`}} aria-label={`${t(place.city as WorldCopyKey)}, ${t(place.country as WorldCopyKey)}${marked?` · ${t('stamped')}`:''}`} onClick={()=>{setSelectedId(place.id);setActiveCountry(place.country);}}><span/></button>;})}
    <div className="passport-map-caption"><MapPin size={13}/><span>{t(selected.city as WorldCopyKey)}, {t(selected.country as WorldCopyKey)}</span><b>{stamps.length} / {destinations.length}</b></div>
   </div>
  </section>

  <section className="world-passport-explorer" aria-labelledby="passport-countries-title">
   <div className="world-passport-explorer-head"><div><p className="world-eyebrow"><span/>DISCOVERY LIST</p><h2 id="passport-countries-title">{t('countryList')}</h2></div><label className="world-passport-search"><Search size={16}/><span className="sr-only">{t('searchCountry')}</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder={t('searchCountry')}/></label></div>
   <div className="world-country-tabs">{visibleCountries.map(country=>{const countryPlaces=destinations.filter(place=>place.country===country);return <button type="button" key={country} className={country===selectedCountry?'active':''} onClick={()=>{setActiveCountry(country);setSelectedId(countryPlaces[0].id);}}><span>{countryPlaces[0].flag}</span><span>{t(country as WorldCopyKey)}</span><b>{countryPlaces.filter(place=>stamps.includes(place.id)).length}/{countryPlaces.length}</b></button>;})}</div>
   <div className="world-passport-destination-layout">
    <div className="world-destination-list">{visiblePlaces.length?visiblePlaces.map(place=>{const marked=stamps.includes(place.id);return <button type="button" key={place.id} className={`world-destination-row ${selected.id===place.id?'selected':''}`} onClick={()=>setSelectedId(place.id)}><span className="world-destination-flag">{place.flag}</span><span><strong>{t(place.city as WorldCopyKey)}</strong><small>{t(place.country as WorldCopyKey)}</small></span><span className={`world-stamp-mini ${marked?'marked':''}`}>{marked?<Check size={14}/>:<Stamp size={14}/>}</span></button>; }):<p className="world-passport-empty">No destinations found.</p>}</div>
    <article className="world-destination-detail"><div className="world-destination-detail-top"><span>{selected.flag}</span><small>{t(selected.country as WorldCopyKey)} · DISCOVERY STOP</small></div><h3>{t(selected.city as WorldCopyKey)}</h3><p>{t('mapNote')}</p><button type="button" className={`world-button-primary ${toggled?'world-button-stamped':''}`} onClick={()=>toggleStamp(selected)}>{toggled?<Check size={16}/>:<Stamp size={16}/>} {toggled?t('removeStamp'):t('stamp')}<ArrowUpRight size={15}/></button><small className="world-destination-coordinates">{selected.lat.toFixed(2)}° · {selected.lon.toFixed(2)}°</small></article>
   </div>
   <p className="world-passport-local-note"><Stamp size={14}/>{t('localNote')} <Link href="/gizlilik">{language==='tr'?'Gizlilik':language==='ru'?'Конфиденциальность':'Privacy'} <ArrowUpRight size={12}/></Link></p>
  </section>
 </div>;
}

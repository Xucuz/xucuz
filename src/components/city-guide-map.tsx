'use client';

import Link from 'next/link';
import {useMemo,useState} from 'react';
import {ArrowRight,MapPin,Search} from 'lucide-react';
import {cityCoordinates} from '@/lib/city-coordinates';
import {citySlug} from '@/lib/city-guide';

const WIDTH=1000,HEIGHT=470;
const bounds={west:25.5,east:45.4,south:35.6,north:42.2};
function project(lon:number,lat:number){return {x:48+(lon-bounds.west)/(bounds.east-bounds.west)*(WIDTH-96),y:26+(bounds.north-lat)/(bounds.north-bounds.south)*(HEIGHT-52)};}
const coast:[[number,number],...Array<[number,number]>]=[[25.9,40.3],[26.3,41.1],[27.1,41.7],[28.8,41.5],[30.4,41.8],[32.3,41.7],[34.1,41.8],[36.4,41.4],[38.4,41.1],[40.4,41.1],[42.3,41.3],[44.9,40.1],[44.5,38.7],[43.2,37.4],[41.7,36.9],[39.5,36.7],[37.7,36.2],[35.4,36.1],[33.5,36.2],[31.8,36.3],[30.2,36.3],[29.1,36.4],[28.5,36.1],[27.7,36.7],[26.8,37.1],[26.5,37.7],[26.8,38.5],[26.1,39.2],[25.9,40.3]];
const shape=coast.map(([lon,lat],index)=>{const p=project(lon,lat);return `${index?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;}).join(' ')+' Z';

export function CityGuideMap(){const [selected,setSelected]=useState('');const [query,setQuery]=useState('');const normalizedQuery=citySlug(query.trim());const matches=useMemo(()=>cityCoordinates.filter(city=>citySlug(city.name).includes(normalizedQuery)).slice(0,8),[normalizedQuery]);const selectedCity=cityCoordinates.find(city=>city.name===selected);
 return <div className="city-map-layout">
  <div className="city-map-canvas"><svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="81 ilin merkezlerini gösteren, şehir seçilebilir Türkiye haritası">
   <defs><linearGradient id="city-land" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#e8f4ec"/><stop offset="1" stopColor="#d5e8df"/></linearGradient><pattern id="city-grid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" fill="none" stroke="#e9eef1" strokeWidth="1"/></pattern></defs>
   <rect width={WIDTH} height={HEIGHT} rx="20" fill="url(#city-grid)"/><path d={shape} fill="url(#city-land)" stroke="#92b5a3" strokeWidth="2.2" strokeLinejoin="round"/>
   {cityCoordinates.map(city=>{const point=project(city.lon,city.lat);const active=city.name===selected;return <g key={city.name} role="button" tabIndex={0} aria-label={`${city.name} şehir rehberini seç`} onClick={()=>setSelected(city.name)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(city.name);}}} className={`city-map-marker${active?' is-active':''}`}><circle cx={point.x} cy={point.y} r={active?12:8}/><circle cx={point.x} cy={point.y} r={active?4:2.7} className="city-map-marker-core"/><title>{city.name}</title></g>;})}
  </svg><span className="city-map-attribution">Noktalar: <a href="https://github.com/open-admin-data/turkey-administrative-divisions" target="_blank" rel="noreferrer">Open Admin Data · CC BY 4.0</a> · İl merkezleri</span></div>
  <div className="city-map-picker"><label htmlFor="city-guide-search"><Search size={18}/><span className="sr-only">Şehir ara</span><input id="city-guide-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Şehir ara…" autoComplete="off"/></label>
   {query&&<div className="city-map-suggestions">{matches.length?matches.map(city=><button type="button" key={city.name} onClick={()=>{setSelected(city.name);setQuery(city.name);}}>{city.name}</button>):<span>Bu ada uygun şehir yok.</span>}</div>}
   {selectedCity?<div className="city-map-selected"><div><MapPin size={17}/><strong>{selectedCity.name}</strong></div><Link href={`/81-il-rehberi/${citySlug(selectedCity.name)}`}>Şehir rehberini aç <ArrowRight size={15}/></Link></div>:<p>Haritadaki bir şehir noktasını seç veya şehir adını ara.</p>}
  </div>
 </div>;
}

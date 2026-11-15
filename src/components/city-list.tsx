'use client';

import Link from 'next/link';
import {useMemo,useState} from 'react';
import {ArrowRight,Search} from 'lucide-react';
import {cityGuides,citySlug} from '@/lib/city-guide';

export function CityList(){const [query,setQuery]=useState('');const normalizedQuery=citySlug(query.trim());const visible=useMemo(()=>cityGuides.filter(city=>citySlug(city.name).includes(normalizedQuery)),[normalizedQuery]);return <><div className="city-section-heading"><div><p className="city-eyebrow">TÜM ŞEHİRLER</p><h2>81 ilin tamamı</h2></div><label className="city-list-search"><Search size={17}/><input aria-label="İl listesinde ara" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Şehir listesinde ara…"/></label></div><div className="city-list-grid">{visible.map(city=>{const index=cityGuides.findIndex(item=>item.slug===city.slug);return <Link href={`/81-il-rehberi/${city.slug}`} key={city.slug}><span>{String(index+1).padStart(2,'0')}</span><strong>{city.name}</strong><ArrowRight size={15}/></Link>;})}</div>{!visible.length&&<p className="city-list-empty">Bu aramayla eşleşen il bulunamadı.</p>}</>;}

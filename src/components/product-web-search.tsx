'use client';

import {FormEvent, useState} from 'react';
import {ArrowUpRight, Search} from 'lucide-react';

const stores=[
 {name:'Trendyol',url:(q:string)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`},
 {name:'Hepsiburada',url:(q:string)=>`https://www.hepsiburada.com/ara?q=${encodeURIComponent(q)}`},
 {name:'n11',url:(q:string)=>`https://www.n11.com/arama?q=${encodeURIComponent(q)}`},
 {name:'Amazon Türkiye',url:(q:string)=>`https://www.amazon.com.tr/s?k=${encodeURIComponent(q)}`},
];

export function ProductWebSearch({initialQuery=''}:{initialQuery?:string}){
 const [query,setQuery]=useState(initialQuery);
 const [searchedQuery,setSearchedQuery]=useState(initialQuery);
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const value=query.trim();if(!value)return;setSearchedQuery(value);window.history.replaceState(null,'',`/ara?q=${encodeURIComponent(value)}`);}
 return <section className="product-web-search" aria-label="Mağazalarda ürün ara">
  <form className="product-web-search-form" onSubmit={submit} role="search"><Search size={20} aria-hidden="true"/><label className="sr-only" htmlFor="product-web-query">Ürün adı</label><input id="product-web-query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Örn. No Frost buzdolabı" autoComplete="off"/><button type="submit" disabled={!query.trim()}>Mağazalarda ara</button></form>
  {!searchedQuery&&<p className="product-web-note">Ürün adını yaz; mağazaların kendi arama sayfalarına geç.</p>}
  {searchedQuery&&<div className="product-web-stores" aria-live="polite"><h2>“{searchedQuery}” için mağaza seç</h2><p>Bağlantı mağazanın arama sayfasını açar. Güncel fiyatı, stoğu ve teslimat koşullarını mağazada kontrol et.</p><div className="product-web-store-grid">{stores.map(store=><a className="product-web-store-link" href={store.url(searchedQuery)} target="_blank" rel="noopener noreferrer" key={store.name}><span>{store.name}</span><ArrowUpRight size={17}/></a>)}</div><small>Mağaza arama bağlantılarıdır; Xucuz fiyat veya stok bilgisi göstermez.</small></div>}
 </section>;
}

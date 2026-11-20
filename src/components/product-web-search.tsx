'use client';

import {FormEvent, useEffect, useState} from 'react';
import {ArrowUpRight, Search} from 'lucide-react';
import {normalize} from '@/lib/categories';
import {money, total} from '@/lib/pricing';
import type {Offer} from '@/lib/types';

type Category='elektronik'|'beyaz-esya'|'market'|'cicek';
type SearchState='idle'|'loading'|'results'|'empty'|'error';
const categoryTerms:[Category,string[]][]=[
 ['beyaz-esya',['buzdolabi','no frost','camasir makinesi','bulasik makinesi','derin dondurucu','firin','beyaz esya']],
 ['elektronik',['telefon','iphone','samsung','laptop','bilgisayar','televizyon','kulaklik','tablet','kamera','elektronik']],
 ['market',['sut','kahve','zeytinyagi','pirinc','deterjan','market','makarna','sabun']],
 ['cicek',['cicek','gul','buket']]
];
const allCategories:Category[]=['elektronik','beyaz-esya','market','cicek'];
function categoriesFor(query:string):Category[]{const q=normalize(query);const found=categoryTerms.filter(([,terms])=>terms.some(term=>q.includes(normalize(term)))).map(([category])=>category);return found.length?[...new Set(found)]:allCategories;}

export function ProductWebSearch({initialQuery=''}:{initialQuery?:string}){
 const [query,setQuery]=useState(initialQuery);const [state,setState]=useState<SearchState>(initialQuery?'loading':'idle');const [offers,setOffers]=useState<Offer[]>([]);const [message,setMessage]=useState('');const [sourceWarnings,setSourceWarnings]=useState<string[]>([]);
 useEffect(()=>{if(!initialQuery.trim())return;let active=true;setState('loading');setMessage('');
  const paramsFor=(category:Category)=>new URLSearchParams({category,q:initialQuery.trim(),sort:'price-asc',page:'1'});
  Promise.all(categoriesFor(initialQuery).map(async category=>{const response=await fetch(`/api/search?${paramsFor(category)}`,{cache:'no-store'});if(!response.ok)throw new Error('search');const data=await response.json();return Array.isArray(data.offers)?data.offers as Offer[]:[]}))
   .then(groups=>{if(!active)return;const items=[...new Map(groups.flat().filter(offer=>!offer.demo&&offer.available&&offer.url).map(offer=>[offer.id,offer])).values()].sort((a,b)=>total(a)-total(b));setOffers(items);setState(items.length?'results':'empty');})
   .catch(()=>{if(active){setOffers([]);setMessage('Fiyat kaynaklarına şu anda erişilemiyor. Biraz sonra tekrar deneyin.');setState('error');}});
  return()=>{active=false;};
 },[initialQuery]);
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const value=query.trim();if(!value)return;window.location.assign(`/ara?q=${encodeURIComponent(value)}`);}
 const shown=state!=='idle';
 return <section className="product-web-search" aria-label="Ürün fiyatlarını ara">
  <form className="product-web-search-form" onSubmit={submit} role="search"><Search size={20} aria-hidden="true"/><label className="sr-only" htmlFor="product-web-query">Ürün adı</label><input id="product-web-query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Örn. No Frost buzdolabı" autoComplete="off"/><button type="submit" disabled={!query.trim()}>Fiyatları bul</button></form>
  {!shown&&<p className="product-web-note">Ürün adını yaz; bağlı mağazalardaki fiyatları karşılaştır.</p>}
  {state==='loading'&&<p className="product-web-status" role="status">Bağlı kaynaklarda aranıyor…</p>}
  {state==='error'&&<p className="product-web-status" role="alert">{message}</p>}
  {state==='empty'&&<div className="product-web-empty" role="status"><strong>{sourceWarnings.length?'Şu anda fiyat kaynağına erişilemiyor.':'Bu arama için gösterilebilir mağaza fiyatı bulunamadı.'}</strong><p>Yalnızca bağlı kaynaklardan gelen, demo olmayan ve satıcı bağlantısı bulunan fiyatları gösteriyoruz.</p></div>}
  {state==='results'&&<div className="product-web-results"><div className="product-web-results-head"><strong>{offers.length} mağaza teklifi</strong><span>Toplam fiyata göre sıralandı</span></div>{offers.map(offer=><article className="product-web-result" key={offer.id}><div className="product-web-result-main"><span className="product-web-provider">{offer.provider}</span><h2>{offer.title}</h2><span className="product-web-source">Kaynak: {offer.source}</span></div><div className="product-web-result-price"><strong>{money(total(offer),offer.currency)}</strong><time dateTime={offer.updatedAt}>Güncellendi: {new Intl.DateTimeFormat('tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(offer.updatedAt))}</time><a href={offer.url!} target="_blank" rel="noopener noreferrer">Mağazaya git <ArrowUpRight size={15}/></a></div></article>)}<p className="product-web-disclaimer">Fiyat ve stok değişebilir. Satın almadan önce mağaza sayfasında doğrulayın.</p></div>}
 </section>;
}

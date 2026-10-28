'use client';
import {useId,useState} from 'react';
import {products,productGroups,searchProducts} from '@/lib/products';
export function ProductSelection({defaultValue=''}:{defaultValue?:string}){
 const [query,setQuery]=useState('');const [selected,setSelected]=useState(defaultValue);const id=useId();
 const matches=searchProducts(query,500);const visible=selected&&!matches.some(p=>p.id===selected)?[products.find(p=>p.id===selected)!,...matches]:matches;
 return <div className="product-selection"><label className="calc-field"><span>Ürün listesinde ara</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Örn. çadır, kahve, SSD" aria-describedby={id}/></label><label className="calc-field"><span>1. Ne almak istiyorsun?</span><select name="urun" required value={selected} onChange={e=>setSelected(e.target.value)}><option value="" disabled>500 ürün arasından seç</option>{productGroups.map(g=><optgroup key={g.slug} label={g.label}>{visible.filter(p=>p.group===g.slug).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</optgroup>)}</select></label><p id={id} role="status" className="small">{query?`${matches.length} ürün bulundu.`:'20 kategoride 500 ürünün tamamı listeleniyor.'}{!matches.length&&' Aramanı değiştir veya temizle.'}</p></div>;
}

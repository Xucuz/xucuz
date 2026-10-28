'use client';
import {useEffect,useId,useState} from 'react';
import {MapPin,Search} from 'lucide-react';
import {useLanguage} from './language-provider';
import {turkiyeCities} from '@/lib/turkiye-cities';
type Suggestion={id:string;name:string;groupLabel:string;kind:'type'|'model'};
export function CommunitySearchForm({initialQuery='',initialCity=''}:{initialQuery?:string;initialCity?:string}){const {t}=useLanguage();const [query,setQuery]=useState(initialQuery);const [city,setCity]=useState(initialCity);const [suggestions,setSuggestions]=useState<Suggestion[]>([]);const [suggestionsFor,setSuggestionsFor]=useState('');const [active,setActive]=useState(-1);const [open,setOpen]=useState(false);const id=useId();
 useEffect(()=>{const term=query.trim();if(term.length<2)return;const controller=new AbortController();const timer=setTimeout(()=>{void fetch(`/api/products?${new URLSearchParams({q:term,limit:'6'})}`,{signal:controller.signal}).then(response=>response.ok?response.json():Promise.reject()).then(data=>{if(!controller.signal.aborted){setSuggestions((data.items??[]) as Suggestion[]);setSuggestionsFor(term);}}).catch(()=>{if(!controller.signal.aborted){setSuggestions([]);setSuggestionsFor(term);}});},100);return()=>{clearTimeout(timer);controller.abort();};},[query]);
 const current=query.trim().length>=2&&suggestionsFor===query.trim()?suggestions:[];
 function select(item:Suggestion){setQuery(item.name);setOpen(false);setActive(-1);}
 return <form action="/fiyatlar" className="community-search" role="search" onSubmit={()=>setOpen(false)}>
  <div className="community-query-wrap"><label className="community-query"><Search size={22}/><span className="sr-only">{t('search')}</span><input type="search" role="combobox" name="q" value={query} onChange={event=>{setQuery(event.target.value.slice(0,120));setOpen(true);setActive(-1);}} onFocus={()=>setOpen(true)} onBlur={()=>{window.setTimeout(()=>setOpen(false),100);}} onKeyDown={event=>{if(event.key==='ArrowDown'&&current.length){event.preventDefault();setOpen(true);setActive(index=>Math.min(current.length-1,index+1));}else if(event.key==='ArrowUp'&&current.length){event.preventDefault();setActive(index=>Math.max(0,index-1));}else if(event.key==='Escape'){setOpen(false);setActive(-1);}else if(event.key==='Enter'&&open&&active>=0&&current[active]){event.preventDefault();select(current[active]);}}} minLength={2} maxLength={120} placeholder={t('placeholder')} autoComplete="off" required aria-autocomplete="list" aria-expanded={open&&current.length>0} aria-controls={`${id}-suggestions`} aria-activedescendant={active>=0?`${id}-${active}`:undefined}/></label>
   {open&&current.length>0&&<ul className="community-suggestions" id={`${id}-suggestions`} role="listbox" aria-label={t('searchSuggestions')}>{current.map((item,index)=><li id={`${id}-${index}`} key={item.id} role="option" aria-selected={index===active} onMouseDown={event=>event.preventDefault()} onClick={()=>select(item)}><span>{item.name}<small>{item.groupLabel} · {item.kind==='model'?'Marka/model':'Ürün türü'}</small></span></li>)}</ul>}
  </div>
  <label className="community-city"><MapPin size={18}/><span className="sr-only">{t('city')}</span><select name="city" value={city} onChange={event=>setCity(event.target.value)}><option value="">{t('allCities')}</option>{turkiyeCities.map(province=><option key={province}>{province}</option>)}</select></label>
  <button className="community-search-button" type="submit">{t('searchAction')}<Search size={17}/></button>
 </form>;
}

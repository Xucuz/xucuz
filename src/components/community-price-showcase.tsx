'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Clock3,MapPin,PackageCheck,ShieldCheck} from 'lucide-react';
import {useLanguage} from './language-provider';

type Observation={id:string;productName:string;brand:string|null;variant:string|null;store:string;city:string;district:string|null;price:number;currency:'TRY';unitPrice:{amount:number;unit:string}|null;campaign:string|null;observedAt:string;expiresAt:string;source:string;disclaimer:string};
const money=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'});
const copy={
 tr:{kicker:'XUCUZ FİYAT PANOSU',title:'Çevrende görülen fiyatlar.',intro:'Fotoğrafla bildirilen ve yönetici tarafından onaylanan güncel gözlemler. Satıcı teklifi veya ülke çapında en düşük fiyat iddiası değildir.',loading:'Onaylı gözlemler yükleniyor…',error:'Fiyat gözlemleri şu an yüklenemedi.',empty:'Vitrinde henüz gösterilebilecek güncel onaylı fiyat yok.',emptyHelp:'İlk gözlemi fiş veya raf etiketi fotoğrafıyla paylaş; onaylanınca burada görünsün.',contribute:'Fiyat gözlemi paylaş',approved:'Yönetici onaylı gözlem',seen:'Görüldü',unit:'Birim fiyat',campaign:'Kampanya',all:'Tüm gözlemleri ara',updated:'Güncel gözlemler; mağazada yeniden kontrol et.'},
 en:{kicker:'XUCUZ PRICE BOARD',title:'Prices seen near you.',intro:'Current observations submitted with photos and approved by a moderator. These are not seller offers or claims of the lowest price nationwide.',loading:'Loading approved observations…',error:'Price observations could not be loaded.',empty:'There are no current approved prices to show yet.',emptyHelp:'Share the first observation with a receipt or shelf-label photo; it will appear after review.',contribute:'Share a price observation',approved:'Moderator-approved observation',seen:'Seen',unit:'Unit price',campaign:'Promotion',all:'Search all observations',updated:'Recent observations; check again in store.'},
 ru:{kicker:'ТАБЛО ЦЕН XUCUZ',title:'Цены рядом с вами.',intro:'Актуальные наблюдения с фотографиями, одобренные модератором. Это не предложения продавцов и не заявление о самой низкой цене по стране.',loading:'Загрузка одобренных наблюдений…',error:'Не удалось загрузить наблюдения цен.',empty:'Пока нет актуальных одобренных цен для показа.',emptyHelp:'Добавьте первое наблюдение с фото чека или ценника; после проверки оно появится здесь.',contribute:'Сообщить о цене',approved:'Наблюдение одобрено модератором',seen:'Замечено',unit:'Цена за единицу',campaign:'Акция',all:'Искать все наблюдения',updated:'Актуальные наблюдения; проверьте цену в магазине.'}
};

export function CommunityPriceShowcase(){
 const {language}=useLanguage();const text=copy[language];const [state,setState]=useState<{loading:boolean;observations:Observation[];error:boolean}>({loading:true,observations:[],error:false});
 useEffect(()=>{let active=true;void fetch('/api/community/prices?latest=1',{cache:'no-store'}).then(async response=>{const body=await response.json() as {observations?:Observation[]};if(!response.ok)throw new Error('load');if(active)setState({loading:false,observations:body.observations??[],error:false});}).catch(()=>{if(active)setState({loading:false,observations:[],error:true});});return()=>{active=false;};},[]);
 return <section className="price-showcase" aria-labelledby="price-showcase-title">
  <div className="price-showcase-heading"><div><p className="community-kicker"><span className="price-showcase-spark" aria-hidden="true"/>{text.kicker}</p><h2 id="price-showcase-title">{text.title}</h2><p>{text.intro}</p></div><span className="price-showcase-proof"><ShieldCheck size={16}/>{text.approved}</span></div>
  {state.loading?<div className="price-showcase-grid" aria-label={text.loading}>{Array.from({length:4},(_,index)=><div className="price-showcase-skeleton" key={index}><span/><span/><span/></div>)}</div>:state.error?<div className="price-showcase-empty" role="status"><PackageCheck size={24}/><p>{text.error}</p><Link href="/fiyatlar">{text.all}<ArrowRight size={15}/></Link></div>:state.observations.length?<>
   <div className="price-showcase-grid">{state.observations.map((item,index)=><article className={`price-showcase-card price-showcase-card-${index%4}`} key={item.id}>
    <div className="price-showcase-card-top"><span><MapPin size={13}/>{[item.district,item.city].filter(Boolean).join(', ')}</span><span className="price-showcase-index">{String(index+1).padStart(2,'0')}</span></div>
    <p className="price-showcase-product">{[item.brand,item.productName].filter(Boolean).join(' ')}</p>{item.variant&&<p className="price-showcase-variant">{item.variant}</p>}
    <strong className="price-showcase-amount">{money.format(item.price/100)}</strong>
    {item.unitPrice&&<span className="price-showcase-unit">{money.format(item.unitPrice.amount/100)} / {item.unitPrice.unit}</span>}
    <div className="price-showcase-card-bottom"><span className="price-showcase-store">{item.store}</span><span className="price-showcase-date"><Clock3 size={12}/>{new Date(item.observedAt).toLocaleDateString(language==='tr'?'tr-TR':language==='ru'?'ru-RU':'en-GB')}</span></div>
    {item.campaign&&<p className="price-showcase-campaign">{text.campaign}: {item.campaign}</p>}
   </article>)}</div>
   <div className="price-showcase-foot"><span><span className="price-showcase-live-dot"/>{text.updated}</span><Link href="/fiyatlar">{text.all}<ArrowRight size={15}/></Link></div>
  </>:<div className="price-showcase-empty"><PackageCheck size={26}/><div><strong>{text.empty}</strong><p>{text.emptyHelp}</p></div><Link href="/fiyat-ekle">{text.contribute}<ArrowRight size={15}/></Link></div>}
 </section>;
}

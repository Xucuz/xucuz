'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';

type Alert={id:string;query:string;city:string;target:number;createdAt:string};
type Observation={id:string;productName:string;brand:string|null;store:string;city:string;price:number;observedAt:string};
type Result={id:string;status:'found'|'none'|'error';price?:number;item?:Observation};
const KEY='xucuz-price-alerts-v1';
const money=(value:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(value);
export function PriceAlerts(){
 const [alerts,setAlerts]=useState<Alert[]>([]);
 const [ready,setReady]=useState(false);
 const [query,setQuery]=useState('');
 const [city,setCity]=useState('');
 const [target,setTarget]=useState('');
 const [results,setResults]=useState<Record<string,Result>>({});
 const [checking,setChecking]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)??'[]') as unknown;if(Array.isArray(saved))setAlerts(saved.filter((a):a is Alert=>!!a&&typeof a==='object'&&typeof a.id==='string'&&typeof a.query==='string'&&typeof a.city==='string'&&typeof a.target==='number'&&Number.isFinite(a.target)&&a.target>0).slice(0,20));}catch{}setReady(true);},[]);
 function save(next:Alert[]){setAlerts(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{setMessage('Tarayıcı kayıt alanına erişilemedi; alarm kalıcı olmayabilir.');}}
 function add(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const amount=Number(target.replace(',','.'));const q=query.trim();if(q.length<2||!Number.isFinite(amount)||amount<=0||amount>100000000){setMessage('Geçerli bir ürün ve hedef fiyat gir.');return;}if(alerts.length>=20){setMessage('En fazla 20 alarm kaydedebilirsin.');return;}save([{id:crypto.randomUUID(),query:q.slice(0,120),city:city.trim().slice(0,40),target:amount,createdAt:new Date().toISOString()},...alerts]);setQuery('');setTarget('');setMessage('Alarm bu tarayıcıya kaydedildi. Fiyatı kontrol et düğmesiyle karşılaştırabilirsin.');}
 async function check(){setChecking(true);setMessage('');const next:Record<string,Result>={};for(const alert of alerts){try{const params=new URLSearchParams({q:alert.query});if(alert.city)params.set('city',alert.city);const response=await fetch('/api/community/prices?'+params.toString(),{cache:'no-store'});if(!response.ok)throw Error('Fiyat servisi kullanılamıyor');const data=await response.json() as {observations?:Observation[]};const matches=(data.observations??[]).filter(x=>Number.isFinite(x.price)&&x.price>0&&x.productName.toLocaleLowerCase('tr-TR').includes(alert.query.toLocaleLowerCase('tr-TR')));const best=matches.sort((a,b)=>a.price-b.price)[0];next[alert.id]=best?{id:alert.id,status:'found',price:best.price/100,item:best}:{id:alert.id,status:'none'};}catch{next[alert.id]={id:alert.id,status:'error'};}}setResults(next);setChecking(false);}
 return <div className="wrap section" style={{maxWidth:850}}>
  <span className="eyebrow">XUCUZ FİYAT ALARMI</span><h1>Hedef fiyatını belirle.</h1>
  <p>Ürün için bir hedef fiyat kaydet. “Fiyatları kontrol et” dediğinde güncel, yönetici onaylı topluluk fiyat gözlemlerini karşılaştırırız.</p>
  <div style={{padding:20,border:'1px solid #cbd5e1',borderRadius:16,margin:'24px 0'}}>
   <form onSubmit={add} style={{display:'grid',gap:12}}>
    <label>Ürün adı<input required minLength={2} maxLength={120} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Örn. iPhone 16" style={{display:'block',width:'100%',padding:12,marginTop:5}}/></label>
    <label>Şehir (isteğe bağlı)<input maxLength={40} value={city} onChange={e=>setCity(e.target.value)} placeholder="Örn. İstanbul" style={{display:'block',width:'100%',padding:12,marginTop:5}}/></label>
    <label>Hedef fiyat (TL)<input required inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Örn. 25000" style={{display:'block',width:'100%',padding:12,marginTop:5}}/></label>
    <button className="btn" type="submit" disabled={!ready}>Alarm kaydet</button>
   </form>
  </div>
  {message&&<p role="status">{message}</p>}
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><h2>Alarmlarım ({alerts.length})</h2><button className="btn" type="button" onClick={()=>void check()} disabled={checking||!alerts.length}>{checking?'Kontrol ediliyor…':'Fiyatları kontrol et'}</button></div>
  {!alerts.length?<p>Henüz kayıtlı alarm yok.</p>:<div style={{display:'grid',gap:12,marginTop:16}}>{alerts.map(a=>{const r=results[a.id];return <article key={a.id} style={{border:'1px solid #cbd5e1',borderRadius:14,padding:16}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><strong>{a.query}</strong><p>Hedef: {money(a.target)}{a.city?' · '+a.city:''}</p></div><button type="button" onClick={()=>{save(alerts.filter(x=>x.id!==a.id));setResults(prev=>{const next={...prev};delete next[a.id];return next;});}} aria-label={a.query+' alarmını sil'}>Sil</button></div>
   {r?.status==='found'&&r.price!==undefined&&<p role="status" style={{fontWeight:700}}>{r.price<=a.target?'Hedef fiyata ulaşıldı!':'Hedef fiyatın üzerinde.'} Gözlemlenen en düşük fiyat: {money(r.price)} · {r.item?.store} · {r.item?.city}</p>}
   {r?.status==='none'&&<p>Bu ürün için eşleşen güncel onaylı fiyat gözlemi bulunamadı.</p>}
   {r?.status==='error'&&<p>Fiyat verisi alınamadı. Daha sonra tekrar dene.</p>}
   <Link href={'/fiyatlar?'+new URLSearchParams({q:a.query,...(a.city?{city:a.city}:{})}).toString()}>Fiyat gözlemlerini incele</Link>
  </article>;})}</div>}
  <p style={{marginTop:24,fontSize:14}}>Önemli: Alarmlar yalnızca bu tarayıcıda saklanır. Şimdilik otomatik e-posta, SMS veya arka plan bildirimi gönderilmez; fiyatları bu sayfadan kontrol etmelisin. Gözlemler mağaza teklifi değildir, satın almadan önce doğrula.</p>
 </div>;
}

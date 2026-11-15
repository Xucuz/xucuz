'use client';

import {useEffect,useState} from 'react';
import {ArrowUpRight,MapPin,Star} from 'lucide-react';

type Place={id:string;name:string;address:string;url:string;category:'Restoran'|'Alışveriş';typeLabel:string;rating?:number;reviewCount?:number};
type ResponseBody={status:'ok'|'unavailable'|'not-found';places?:Place[];source?:'google'|'openstreetmap';message?:string};

export function CityPopularPlaces({slug,city}:{slug:string;city:string}){
 const [result,setResult]=useState<ResponseBody|null>(null);
 const [loading,setLoading]=useState(true);
 const mapSearchUrl=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${city} restoran kafe alışveriş`)}`;

 useEffect(()=>{
  const controller=new AbortController();
  void fetch(`/api/city-guide/${encodeURIComponent(slug)}/places`,{signal:controller.signal,cache:'no-store'})
   .then(async response=>{
    const body=await response.json() as ResponseBody;
    if(!response.ok&&body.status!=='unavailable')throw new Error('Mekân verileri alınamadı.');
    setResult(body);
   })
   .catch(()=>{if(!controller.signal.aborted)setResult({status:'unavailable',places:[],message:'Mekân bilgileri şu anda alınamadı.'});})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[slug]);

 const usesGoogle=result?.source==='google';
 return <section className="city-popular-places">
  <div className="city-section-heading"><div><p className="city-eyebrow">{usesGoogle?'GOOGLE YORUMLARINA GÖRE':'AÇIK HARİTA KAYITLARI'}</p><h2>{city}’deki mekânlar ve alışveriş yerleri</h2></div><a href={mapSearchUrl} target="_blank" rel="noreferrer">OpenStreetMap’te aç <ArrowUpRight size={14}/></a></div>
  {loading?<div className="city-places-state" role="status">Şehirdeki mekân kayıtları alınıyor…</div>:result?.status==='unavailable'?<div className="city-places-state">{result.message??'Mekân kayıtlarına şu anda ulaşılamadı.'} <a href={mapSearchUrl} target="_blank" rel="noreferrer">Haritada ara <ArrowUpRight size={13}/></a></div>:result?.places?.length?<div className="city-popular-grid">{result.places.map(place=><article className="city-popular-card" key={place.id}><span className="city-popular-type">{place.category} · {place.typeLabel}</span><h3>{place.name}</h3><p><MapPin size={14}/>{place.address}</p>{place.rating!==undefined&&place.reviewCount!==undefined?<div className="city-place-rating"><span><Star size={14} fill="currentColor"/>{place.rating.toFixed(1)}</span><small>{place.reviewCount.toLocaleString('tr-TR')} Google yorumu</small></div>:<div className="city-place-rating"><small>Topluluk harita kaydı · Google puanı yok</small></div>}<a href={place.url} target="_blank" rel="noreferrer">Haritada görüntüle <ArrowUpRight size={13}/></a></article>)}</div>:<div className="city-places-state">Bu il için henüz mekân kaydı bulunamadı. <a href={mapSearchUrl} target="_blank" rel="noreferrer">Haritada ara <ArrowUpRight size={13}/></a></div>}
  <p className="city-places-attribution">{usesGoogle?'Mekân ve puan bilgileri Google Places’tan gelir; puanlar değişebilir.':'Mekân ve adresler OpenStreetMap topluluk verilerinden alınır; harita kayıtları eksik veya güncelliğini yitirmiş olabilir. Google yorum puanı bu kaynakta bulunmaz.'} Kaynak: <a href={usesGoogle?'https://maps.google.com/':'https://www.openstreetmap.org/copyright'} target="_blank" rel="noreferrer">{usesGoogle?'Google Maps':'© OpenStreetMap katkıda bulunanlar'}</a>.</p>
 </section>;
}

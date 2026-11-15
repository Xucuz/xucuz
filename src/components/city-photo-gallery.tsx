'use client';

import Image from 'next/image';
import {useEffect,useState} from 'react';

type Photo={title:string;imageUrl:string;originalUrl:string;filePage:string;license:string;licenseUrl:string;artist:string};
export function CityPhotoGallery({slug,city}:{slug:string;city:string}){const [photos,setPhotos]=useState<Photo[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();void fetch(`/api/city-guide/${encodeURIComponent(slug)}/photos`,{signal:controller.signal}).then(async response=>{const body=await response.json() as {photos?:Photo[];error?:string};if(!response.ok)throw new Error(body.error??'Fotoğraf verisi alınamadı.');setPhotos(body.photos??[]);}).catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'Fotoğraf kaynağına ulaşılamadı.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[slug]);
 return <section className="city-photo-section"><div className="city-section-heading"><div><p className="city-eyebrow">GÖRSEL GALERİ</p><h2>{city} fotoğrafları</h2></div><a href="https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=" target="_blank" rel="noreferrer">Wikimedia Commons</a></div>
  {loading?<div className="city-photo-empty" role="status">Lisans ve üretici bilgileri kontrol edilen fotoğraflar aranıyor…</div>:photos.length?<div className="city-photo-grid">{photos.map(photo=><figure key={photo.filePage}><a className="city-photo-image" href={photo.filePage} target="_blank" rel="noreferrer"><Image src={photo.imageUrl} alt={`${city}: ${photo.title}`} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" unoptimized/></a><figcaption><a href={photo.filePage} target="_blank" rel="noreferrer">{photo.title.replace(/^File:/,'')}</a><span>Fotoğraf: {photo.artist}</span><span>Lisans: <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></span></figcaption></figure>)}</div>:<div className="city-photo-empty">{error||'Bu şehir için lisansı ve üretici bilgisi doğrulanmış fotoğraf bulunamadı.'} <a href={`https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(`${city} Turkey`)}`} target="_blank" rel="noreferrer">Commons’ta ara</a></div>}
  <p className="city-photo-note">Her fotoğrafın lisansı ve üretici bilgisi kendi dosya sayfasında gösterilir. Yalnızca atıf koşulları uygun Creative Commons veya kamu malı kayıtları listelenir.</p>
 </section>;
}

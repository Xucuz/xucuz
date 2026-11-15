'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {FormEvent,useEffect,useMemo,useState} from 'react';
import {ArrowRight,Bell,Bus,Camera,Car,ChevronRight,Compass,Gift,Home,MapPin,Pencil,Plane,Scale,Search,ShoppingBag,ShoppingBasket,ShoppingCart,Shirt,Store,Utensils,Hotel,Monitor,Tag,UserRound} from 'lucide-react';
import {cityGuides,citySlug,cultureSearchUrl} from '@/lib/city-guide';
import type {LicensedCityPhoto} from '@/lib/city-guide-photos';

type Photo=LicensedCityPhoto;
type Place={id:string;name:string;address:string;url:string;category:'Restoran'|'Alışveriş';typeLabel:string};
type PlaceResponse={places?:Place[];source?:string};
type Card={title:string;href:string;eyebrow?:string;image?:Photo};

const categories=[
 {title:'Otel / Konaklama',href:'/otel',icon:<Hotel/>,color:'blue'},
 {title:'Uçak Bileti',href:'/ucak',icon:<Plane/>,color:'sky'},
 {title:'Otobüs Bileti',href:'/otobus',icon:<Bus/>,color:'purple'},
 {title:'Market Fiyatları',href:'/market',icon:<ShoppingCart/>,color:'green'},
 {title:'Otomobil',href:'/otomobil',icon:<Car/>,color:'orange'},
 {title:'Elektronik',href:'/elektronik',icon:<Monitor/>,color:'pink'},
 {title:'Beyaz Eşya',href:'/beyaz-esya',icon:<ShoppingBasket/>,color:'violet'},
 {title:'81 İl Rehberi',href:'/81-il-rehberi',icon:<MapPin/>,color:'outline'},
];
const topicTabs=[
 {id:'food',label:'Yöresel Yemekler',icon:<Utensils size={18}/>},
 {id:'products',label:'Yöresel Ürünler',icon:<ShoppingBag size={18}/>},
 {id:'clothing',label:'Yöresel Giyim',icon:<Shirt size={18}/>},
 {id:'sights',label:'Gezilecek Yerler',icon:<Camera size={18}/>},
 {id:'stay',label:'Konaklama Önerileri',icon:<Hotel size={18}/>},
 {id:'places',label:'Yerel Fırsatlar',icon:<Store size={18}/>},
 {id:'about',label:'İl Hakkında',icon:<MapPin size={18}/>},
];
const adanaFood=[
 {title:'Adana kebabı',query:'Adana kebabı yöresel yemek'},
 {title:'Şalgam',query:'Adana şalgam yöresel içecek'},
 {title:'Bici bici',query:'Adana bici bici tatlısı'},
 {title:'Sıkma',query:'Adana sıkma yöresel yemek'},
];
const adanaSights=[
 {title:'Taş Köprü',query:'Adana Taş Köprü'},
 {title:'Sabancı Merkez Camii',query:'Adana Sabancı Merkez Camii'},
 {title:'Varda Köprüsü',query:'Adana Varda Köprüsü'},
 {title:'Kapıkaya Kanyonu',query:'Adana Kapıkaya Kanyonu'},
];
const letters=['Tümü',...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVY Z'.replaceAll(' ','')];

export function CityGuideHome({initialPhotos=[],initialFoodPhotos=[]}:{initialPhotos?:Photo[];initialFoodPhotos?:Photo[]}){
 const router=useRouter();
 const [selectedSlug,setSelectedSlug]=useState('adana');
 const [query,setQuery]=useState('');
 const [activeTab,setActiveTab]=useState('food');
 const [letter,setLetter]=useState('Tümü');
 const [photoState,setPhotoState]=useState<{slug:string;photos:Photo[]}>({slug:'adana',photos:initialPhotos});
 const [foodPhotoState,setFoodPhotoState]=useState<{slug:string;photos:Photo[]}>({slug:'adana',photos:initialFoodPhotos});
 const [placeState,setPlaceState]=useState<{slug:string;places:Place[]}>({slug:'',places:[]});
 const photos=photoState.slug===selectedSlug?photoState.photos:[];
 const foodPhotos=foodPhotoState.slug===selectedSlug?foodPhotoState.photos:[];
 const photoLoading=photoState.slug!==selectedSlug;
 const places=placeState.slug===selectedSlug?placeState.places:[];
 const placeLoading=activeTab==='places'&&placeState.slug!==selectedSlug;
 const selectedCity=cityGuides.find(city=>city.slug===selectedSlug)??cityGuides[0];
 const normalized=citySlug(query.trim());
 const suggestions=useMemo(()=>normalized?cityGuides.filter(city=>citySlug(city.name).includes(normalized)).slice(0,7):[],[normalized]);
 const visibleCities=useMemo(()=>cityGuides.filter(city=>{
  const byLetter=letter==='Tümü'||city.name.toLocaleUpperCase('tr-TR').startsWith(letter);
  return byLetter&&(!normalized||citySlug(city.name).includes(normalized));
 }),[letter,normalized]);
 const featuredPhoto=photos[0];

 useEffect(()=>{
  if(selectedSlug==='adana'&&initialPhotos.length)return;
  const controller=new AbortController();
  void fetch(`/api/city-guide/${selectedSlug}/photos`,{signal:controller.signal})
   .then(response=>response.ok?response.json():Promise.reject())
   .then(body=>setPhotoState({slug:selectedSlug,photos:(body.photos??[]) as Photo[]}))
   .catch(()=>{if(!controller.signal.aborted)setPhotoState({slug:selectedSlug,photos:[]});});
  return()=>controller.abort();
 },[selectedSlug,initialPhotos]);

 useEffect(()=>{
  if(activeTab!=='food'||foodPhotoState.slug===selectedSlug)return;
  const controller=new AbortController();
  void fetch(`/api/city-guide/${selectedSlug}/photos?topic=food`,{signal:controller.signal})
   .then(response=>response.ok?response.json():Promise.reject())
   .then(body=>setFoodPhotoState({slug:selectedSlug,photos:(body.photos??[]) as Photo[]}))
   .catch(()=>{if(!controller.signal.aborted)setFoodPhotoState({slug:selectedSlug,photos:[]});});
  return()=>controller.abort();
 },[activeTab,selectedSlug,foodPhotoState.slug]);

 useEffect(()=>{
  if(activeTab!=='places')return;
  const controller=new AbortController();
  void fetch(`/api/city-guide/${selectedSlug}/places`,{signal:controller.signal})
   .then(response=>response.ok?response.json():Promise.reject())
   .then(body=>setPlaceState({slug:selectedSlug,places:((body as PlaceResponse).places??[]).slice(0,4)}))
   .catch(()=>{if(!controller.signal.aborted)setPlaceState({slug:selectedSlug,places:[]});});
  return()=>controller.abort();
 },[activeTab,selectedSlug]);

 function chooseCity(slug:string){setSelectedSlug(slug);setQuery('');setLetter('Tümü');setActiveTab('food');}
 function submitSearch(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const exact=cityGuides.find(city=>citySlug(city.name)===normalized);
  if(exact){chooseCity(exact.slug);document.getElementById('home-city-directory')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(query.trim())router.push(`/fiyatlar?q=${encodeURIComponent(query.trim())}`);
 }

 const foodCards:Card[]=selectedCity.slug==='adana'?adanaFood.map((item,index)=>({title:item.title,eyebrow:'ADANA LEZZETİ',href:cultureSearchUrl(selectedCity.name,item.query),image:foodPhotos[index]})):[
  {title:`${selectedCity.name} mutfağı`,eyebrow:'YÖRESEL MUTFAK',href:cultureSearchUrl(selectedCity.name,'yöresel yemekler geleneksel mutfak')},
  {title:'Coğrafi işaretli lezzetler',eyebrow:'YÖRESEL LEZZETLER',href:cultureSearchUrl(selectedCity.name,'coğrafi işaretli yemekler')},
  {title:'Yöresel tatlılar',eyebrow:'TATLILAR',href:cultureSearchUrl(selectedCity.name,'yöresel tatlılar')},
  {title:'Kahvaltı kültürü',eyebrow:'YEREL MUTFAK',href:cultureSearchUrl(selectedCity.name,'yöresel kahvaltı')},
 ];
 const tabCards:Card[]=activeTab==='food'?foodCards:activeTab==='products'?
  [{title:'Coğrafi işaretli ürünler',eyebrow:'YEREL ÜRÜNLER',href:cultureSearchUrl(selectedCity.name,'coğrafi işaretli ürünler')},{title:'El sanatları',eyebrow:'GELENEKSEL ÜRETİM',href:cultureSearchUrl(selectedCity.name,'el sanatları')},{title:'Yöresel pazarlar',eyebrow:'ALIŞVERİŞ',href:`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${selectedCity.name} yöresel pazar`)}`},{title:'Yerel üreticiler',eyebrow:'YEREL İŞLETMELER',href:`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${selectedCity.name} yerel üretici`)}`}]:activeTab==='clothing'?
  [{title:'Dokuma kültürü',eyebrow:'YÖRESEL GİYİM',href:cultureSearchUrl(selectedCity.name,'dokuma kumaş')},{title:'Geleneksel kıyafetler',eyebrow:'YÖRESEL GİYİM',href:cultureSearchUrl(selectedCity.name,'geleneksel kıyafetler')},{title:'El dokumaları',eyebrow:'EL SANATLARI',href:cultureSearchUrl(selectedCity.name,'el dokuması')},{title:'Yerel tasarımcılar',eyebrow:'ALIŞVERİŞ',href:`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${selectedCity.name} giyim mağazası`)}`}]:activeTab==='sights'?
  (selectedCity.slug==='adana'?adanaSights.map(item=>({title:item.title,eyebrow:'GEZİLECEK YER',href:cultureSearchUrl(selectedCity.name,item.query)})):photos.slice(0,4).map(photo=>({title:photo.title.replace(/^File:/,''),eyebrow:'WIKIMEDIA COMMONS',href:photo.filePage,image:photo}))).concat(photos.length<4&&selectedCity.slug!=='adana'?[{title:`${selectedCity.name} gezi rehberi`,eyebrow:'KÜLTÜR PORTALI',href:`https://www.kulturportali.gov.tr/turkiye/${selectedCity.slug}/gezilecekyer`}]:[]).slice(0,4):activeTab==='stay'?
  [{title:`${selectedCity.name} otellerini karşılaştır`,eyebrow:'KONAKLAMA',href:`/otel?${new URLSearchParams({city:selectedCity.name})}`},{title:'Ulaşım seçenekleri',eyebrow:'YOLCULUK',href:'/ucak'},{title:'Otobüs biletlerini ara',eyebrow:'ŞEHİRLER ARASI',href:'/otobus'},{title:'Seyahat rehberi',eyebrow:'XUCUZ REHBER',href:'/rehberler'}]:activeTab==='about'?
  [{title:`${selectedCity.name} il rehberi`,eyebrow:'İL HAKKINDA',href:`/81-il-rehberi/${selectedCity.slug}`},{title:'Yöresel kültür',eyebrow:'KÜLTÜR PORTALI',href:cultureSearchUrl(selectedCity.name,'yerel kültür')},{title:'Tarih ve kültür',eyebrow:'DOĞRULANABİLİR BİLGİ',href:`https://www.kulturportali.gov.tr/turkiye/${selectedCity.slug}`},{title:'Fotoğraf galerisi',eyebrow:'LİSANSLI FOTOĞRAFLAR',href:`/81-il-rehberi/${selectedCity.slug}`}]:[];
 const sightCards:Card[]=photos.slice(1,5).map(photo=>({title:photo.title.replace(/^File:/,''),href:photo.filePage,image:photo}));
 const usedPhotos=[...new Map([...photos.slice(0,5),...foodPhotos.slice(0,4)].map(photo=>[photo.filePage,photo])).values()];

 return <div className="city-landing-home">
  <header className="city-home-header"><Link href="/" className="city-home-brand" aria-label="Xucuz.com ana sayfa"><ShoppingBag/><span><strong><b>XU</b>cuz<span>.com</span></strong><small>Türkiye’nin Karşılaştırmalı Ucuz Arama Motoru</small></span></Link><nav aria-label="Ana menü"><Link href="/"><Home/><span>Ana Sayfa</span></Link><Link className="active" href="/81-il-rehberi"><MapPin/><span>81 İl Rehberi</span></Link><Link href="/karsilastir"><Scale/><span>Karşılaştır</span></Link><Link href="/kampanyalar"><Tag/><span>Fırsatlar</span></Link><Link href="/rehberler"><Pencil/><span>Blog</span></Link><Link href="/favoriler"><Bell/><span>Favoriler</span></Link></nav><div className="city-home-account"><Link href="/favoriler"><UserRound/>Giriş Yap</Link><Link className="join" href="/magazalar"><Gift/>Ücretsiz Üye Ol</Link></div></header>
  <section className="city-home-hero" aria-labelledby="city-home-title">
   <div className="city-home-hero-gallery" aria-hidden="true">{photos.slice(0,4).map((photo,index)=><Image key={photo.filePage} src={photo.imageUrl} alt="" fill priority={index===0} unoptimized sizes="100vw" className={`city-home-hero-photo panel-${index+1}`}/>)}</div>
   <div className="city-home-hero-shade"/>
   <div className="city-home-hero-inner">
    <div className="city-home-hero-copy"><p className="city-home-kicker">81 İL · YEMEK · KÜLTÜR · GEZİ</p><h1 id="city-home-title">Türkiye’yi 81 İliyle Keşfet!</h1><p>Her ilin özel lezzetleri, alışveriş önerileri, yöresel ürünleri, gezilecek yerleri ve daha fazlası Xucuz.com’da.</p>
     <form className="city-home-search" role="search" onSubmit={submitSearch}><Search size={21}/><label className="sr-only" htmlFor="city-home-query">İl, ürün, yemek, yer veya kategori ara</label><input id="city-home-query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="İl, ürün, yemek, yer veya kategori ara…" autoComplete="off"/><button type="submit">Ara <ArrowRight size={17}/></button>
      {suggestions.length>0&&<div className="city-home-suggestions">{suggestions.map(city=><button type="button" key={city.slug} onClick={()=>chooseCity(city.slug)}><MapPin size={14}/>{city.name}<span>İl rehberini aç</span></button>)}</div>}
     </form>
    </div>
    <div className="city-home-hero-art"><Image src="/xucina-brand.jpg" alt="Xucina ve sihirli lambası" width={1280} height={853} priority unoptimized/></div>
   </div>
  </section>

  <nav className="city-home-category-row" aria-label="Alışveriş ve seyahat kategorileri">{categories.map(item=><Link href={item.href} className={`city-home-category ${item.color}`} key={item.title}><span>{item.icon}</span><strong>{item.title}</strong></Link>)}</nav>

  <section className="city-home-guide-intro"><div className="city-home-guide-copy"><h2><span>81 İl</span> Türkiye Rehberi</h2><p>Her ilin kültürü, yöresel yemekleri, meşhur ürünleri, gezilecek yerleri ve alışveriş önerileri tek yerde.</p></div><div className="city-home-guide-tabs" aria-label="Rehber kategorileri">{topicTabs.map(tab=><button type="button" key={tab.id} className={activeTab===tab.id?'active':''} onClick={()=>{setActiveTab(tab.id);document.getElementById('home-city-directory')?.scrollIntoView({behavior:'smooth',block:'nearest'});}}><span>{tab.icon}</span><strong>{tab.label}</strong></button>)}</div></section>

  <section className="city-home-directory" id="home-city-directory">
   <div className="city-home-directory-heading"><h2>İllere Göre Keşfet <span>(81 İl)</span></h2><label><Search size={16}/><span className="sr-only">İl ara</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="İl ara…"/></label><div className="city-home-letters" aria-label="İlk harfe göre filtrele">{letters.map(item=><button type="button" key={item} className={letter===item?'selected':''} onClick={()=>setLetter(item)}>{item}</button>)}</div></div>
   <div className="city-home-feature-layout">
    <aside className="city-home-city-list" aria-label="81 il"><div className="city-home-selected-label"><MapPin size={15}/> Şehir seç</div><div className="city-home-city-scroll">{visibleCities.map(city=><button type="button" key={city.slug} className={selectedSlug===city.slug?'selected':''} onClick={()=>chooseCity(city.slug)}><MapPin size={13}/>{city.name}</button>)}</div><Link href="/81-il-rehberi" className="city-home-all-cities">81 ilin tamamını gör <ArrowRight size={13}/></Link></aside>
    <article className="city-home-featured-city">
     <Link href={`/81-il-rehberi/${selectedCity.slug}`} className="city-home-city-image">
      {featuredPhoto?<Image src={featuredPhoto.imageUrl} alt={`${selectedCity.name}: ${featuredPhoto.title}`} fill unoptimized sizes="(max-width: 700px) 100vw, 40vw"/>:<div className="city-home-photo-fallback"><Compass size={38}/><span>{selectedCity.name}</span></div>}
      <span className="city-home-city-image-overlay"/><span className="city-home-city-image-label"><MapPin size={20}/><strong>{selectedCity.name}</strong><small>Şehir rehberini keşfet</small></span>
     </Link>
     <div className="city-home-featured-body"><div className="city-home-featured-heading"><h3>{selectedCity.name}’de {topicTabs.find(tab=>tab.id===activeTab)?.label.toLocaleLowerCase('tr-TR')}</h3><Link href={`/81-il-rehberi/${selectedCity.slug}`}>İl sayfası <ChevronRight size={15}/></Link></div>
      {activeTab==='places'?<div className="city-home-info-grid">{placeLoading?<p className="city-home-empty">Mekânlar yükleniyor…</p>:places.length?places.map(place=><a className="city-home-info-card" href={place.url} target="_blank" rel="noreferrer" key={place.id}><span>{place.category} · {place.typeLabel}</span><strong>{place.name}</strong><small><MapPin size={12}/>{place.address}</small></a>):<a className="city-home-info-card empty" href={`/81-il-rehberi/${selectedCity.slug}#reklam-alanlari`}><span>YEREL İŞLETMELER</span><strong>Bu şehirde keşfedilecek yerleri gör</strong><small>İşletme reklam alanları ve açık harita kayıtları</small></a>}</div>:<div className="city-home-info-grid">{tabCards.map((card,index)=><a className="city-home-info-card" href={card.href} target={card.href.startsWith('http')?'_blank':undefined} rel={card.href.startsWith('http')?'noreferrer':undefined} key={`${card.title}-${index}`}>{card.image&&<span className="city-home-info-image"><Image src={card.image.imageUrl} alt="" fill unoptimized sizes="(max-width:700px) 50vw, 16vw"/></span>}<span>{card.eyebrow??'ŞEHİR REHBERİ'}</span><strong>{card.title}</strong><small>Kaynağı incele <ArrowRight size={12}/></small></a>)}</div>}
     </div>
     <div className="city-home-sights"><div><h3>{selectedCity.name}’da gezilecek yerler</h3><Link href={`/81-il-rehberi/${selectedCity.slug}`}>Tümünü gör <ArrowRight size={13}/></Link></div><div className="city-home-sights-grid">{sightCards.slice(0,4).map((sight,index)=><a href={sight.href} target={sight.href.startsWith('http')?'_blank':undefined} rel={sight.href.startsWith('http')?'noreferrer':undefined} key={`${sight.title}-${index}`}>{sight.image?<span className="city-home-sight-image"><Image src={sight.image.imageUrl} alt="" fill unoptimized sizes="(max-width:700px) 50vw, 15vw"/></span>:<span className="city-home-sight-placeholder"><MapPin size={19}/></span>}<strong>{sight.title}</strong></a>)}</div>{sightCards.length===0&&<p className="city-home-empty">{photoLoading?'Lisanslı şehir görselleri aranıyor.':'Bu il için lisansı doğrulanmış görsel bulunamadı.'}</p>}</div>
     <div className="city-home-attribution">{usedPhotos.length?<span>Fotoğraf kaynakları: {usedPhotos.map((photo,index)=><span key={photo.filePage}>{index>0?' · ':''}<a href={photo.filePage} target="_blank" rel="noreferrer">{photo.artist.replace(/^.*?:User:/i,'')}</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></span>)}</span>:<span>Şehir bilgileri için Kültür Portalı ve lisans bilgili Wikimedia Commons kayıtları kullanılır.</span>}<Link href={`/81-il-rehberi/${selectedCity.slug}`}>Şehir sayfasına git <ArrowRight size={13}/></Link></div>
    </article>
   </div>
  </section>
 </div>;
}

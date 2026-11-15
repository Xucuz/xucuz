import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BookOpen,MapPin,ShoppingBag,Utensils} from 'lucide-react';
import {notFound} from 'next/navigation';
import {cityGuides,cultureSearchUrl,getCityGuide} from '@/lib/city-guide';
import {CityPhotoGallery} from '@/components/city-photo-gallery';
import {CityAdvertisingSlots} from '@/components/city-advertising-slots';
import {CityPopularPlaces} from '@/components/city-popular-places';

export function generateStaticParams(){return cityGuides.map(city=>({slug:city.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const city=getCityGuide(slug);if(!city)return{};return{title:`${city.name} Rehberi`,description:`${city.name} için lisans bilgili şehir fotoğrafları, yöresel lezzetler, el sanatları, gezilecek yerler, yerel alışveriş ve işletme tanıtımları.`,alternates:{canonical:`/81-il-rehberi/${city.slug}`},openGraph:{title:`${city.name} şehir rehberi | Xucuz`,description:`${city.name} için kültür kaynakları, fotoğraf galerisi ve yerel işletme tanıtımları.`}};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const city=getCityGuide(slug);if(!city)notFound();const portalBase=`https://www.kulturportali.gov.tr/turkiye/${city.slug}`;const mapSearch=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${city.name} yerel ürünler çarşı`)}`;
 return <article className="city-detail-page"><nav className="city-breadcrumb"><Link href="/81-il-rehberi"><ArrowLeft size={15}/> 81 İl Rehberi</Link><span>/</span><span>{city.name}</span></nav>
  <header className="city-detail-hero"><div><p className="city-eyebrow">TÜRKİYE · ŞEHİR REHBERİ</p><h1>{city.name}</h1><p>{city.name} için fotoğraf galerisi, yöresel mutfak ve ürünler, gezilecek yerler ve şehirdeki işletme tanıtımlarını keşfet.</p><div className="city-detail-actions"><a href={portalBase} target="_blank" rel="noreferrer">Resmî Kültür Portalı <ArrowRight size={15}/></a><a href="#reklam-alanlari">Şehirdeki mekânlar <ArrowRight size={15}/></a></div></div><div className="city-detail-index"><MapPin size={20}/><span>İl rehberi</span><strong>{String(cityGuides.findIndex(item=>item.slug===city.slug)+1).padStart(2,'0')} <small>/ 81</small></strong><Link href="/81-il-rehberi">Haritada diğer iller <ArrowRight size={14}/></Link></div></header>
  <CityPhotoGallery slug={city.slug} city={city.name}/>
  <section className="city-content-section"><div className="city-section-heading"><div><p className="city-eyebrow">KÜLTÜR VE GEZİ</p><h2>{city.name} hakkında doğrulanabilir kaynaklar</h2></div><a href={portalBase} target="_blank" rel="noreferrer">Türkiye Kültür Portalı <ArrowRight size={14}/></a></div>
   <div className="city-topic-grid"><a href={`${portalBase}/gezilecekyer`} target="_blank" rel="noreferrer"><span><MapPin size={20}/></span><small>GEZİ REHBERİ</small><strong>Müzeler, tarihî yapılar ve doğal güzellikler</strong><p>Kültür ve Turizm Bakanlığı’nın şehir için yayımladığı içerikleri aç.</p><em>Resmî kaynakta görüntüle <ArrowRight size={14}/></em></a>
    <a href={cultureSearchUrl(city.name,'yöresel yemekler geleneksel mutfak')} target="_blank" rel="noreferrer"><span><Utensils size={20}/></span><small>YÖRESEL MUTFAK</small><strong>Yerel yemekleri ve lezzetleri keşfet</strong><p>Şehir adına göre Kültür Portalı içeriklerinde ara.</p><em>Kaynakta ara <ArrowRight size={14}/></em></a>
    <a href={cultureSearchUrl(city.name,'dokuma el sanatları coğrafi işaretli ürünler')} target="_blank" rel="noreferrer"><span><BookOpen size={20}/></span><small>YÖRESEL ÜRÜNLER</small><strong>Dokuma, giyim ve el sanatları</strong><p>Şehre ait ürün ve kültür kayıtlarını kaynak sayfasında incele.</p><em>Kaynakta ara <ArrowRight size={14}/></em></a>
    <a href={mapSearch} target="_blank" rel="noreferrer"><span><ShoppingBag size={20}/></span><small>ALIŞVERİŞ</small><strong>Yerel işletmeleri haritada bul</strong><p>OpenStreetMap topluluk haritasındaki şehir aramasını aç. Kayıtlar eksik veya güncelliğini yitirmiş olabilir.</p><em>Haritada ara <ArrowRight size={14}/></em></a>
   </div><p className="city-source-note">Kültür Portalı bağlantıları şehir bazlı birincil bilgi kaynağıdır. Dış kaynaktaki içeriklerin telif ve kullanım koşulları ilgili yayıncıya aittir; Xucuz bu sayfada kaynak metin veya görsellerin kopyasını yayımlamaz.</p>
  </section>
  <CityAdvertisingSlots city={city.name}/><CityPopularPlaces slug={city.slug} city={city.name}/>
  <nav className="city-neighbor-nav"><Link href="/81-il-rehberi"><ArrowLeft size={15}/> 81 ilin tümü</Link><Link href={`/81-il-rehberi/${cityGuides[(cityGuides.findIndex(item=>item.slug===city.slug)+1)%cityGuides.length].slug}`}>Sonraki şehir <ArrowRight size={15}/></Link></nav>
 </article>;
}

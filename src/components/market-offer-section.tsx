import Link from 'next/link';
import {ArrowRight,CalendarDays,Info} from 'lucide-react';
import {OfferCard} from '@/components/offer-card';
import {canPublishSource,publicSources} from '@/lib/public-prices/catalog';
import {loadPublicSnapshot} from '@/lib/public-prices/read';

async function currentOffers(){
 if(process.env.PUBLIC_PRICES_ENABLED==='0'||!publicSources.some(source=>canPublishSource(source)&&source.pages.some(page=>page.category==='market')))return [];
 try{return (await loadPublicSnapshot()).offers.filter(offer=>offer.category==='market').sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)).slice(0,4);}
 catch{return [];}
}

export async function MarketOfferSection(){
 const offers=await currentOffers();
 return <section className="wrap market-week-section" aria-labelledby="market-week-title">
  <div className="market-section-heading">
   <div><span className="market-kicker"><span/> HAFTALIK MARKET REHBERİ</span><h2 id="market-week-title">Bu haftanın doğrulanmış fiyatları</h2><p>Yalnızca yayımlama koşulları incelenmiş ve güncelliği doğrulanmış kayıtlar.</p></div>
   <Link href="/market-rehberi" className="market-text-link">Rehberin tamamı <ArrowRight size={16}/></Link>
  </div>
  {offers.length?<div className="market-offer-list">{offers.map(offer=><OfferCard key={offer.id} offer={offer}/>)}</div>:<div className="market-empty-state"><div className="market-empty-icon"><CalendarDays size={22}/></div><div><h3>Şu anda yayımlanabilir fiyat kaydı yok.</h3><p>İzinli kaynak ve güncel fiyat doğrulanana kadar burada teklif göstermiyoruz. Ürün miktarını ve gördüğün fiyatı girerek kendi birim fiyat karşılaştırmanı yapabilirsin.</p><Link href="/birim-fiyat" className="market-text-link">Birim fiyatı hesapla <ArrowRight size={16}/></Link></div><span className="market-empty-note"><Info size={15}/> Bu alan örnek fiyat içermez.</span></div>}
 </section>;
}

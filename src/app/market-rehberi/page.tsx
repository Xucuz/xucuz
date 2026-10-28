import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight,Check,Scale,ShieldCheck} from 'lucide-react';
import {products} from '@/lib/products';
import {ProductSearch} from '@/components/product-search';
import {MarketOfferSection} from '@/components/market-offer-section';

export const metadata:Metadata={title:'Haftalık market rehberi ve fiyat karşılaştırması',description:'Market ürünlerinde miktarı eşitle, birim fiyatı hesapla, kampanya koşullarını ve fiyat kaynağını kontrol et.',alternates:{canonical:'/market-rehberi'}};

const checks=[
 {title:'Ürün aynı mı?',text:'Marka, çeşit, içerik, net miktar ve paket adedini kontrol et. Benzer görünen her ürün aynı karşılaştırma grubuna girmez.'},
 {title:'Ölçüyü eşitledin mi?',text:'Gramajları kilogram, hacimleri litre, adetli ürünleri adet üzerinden hesapla. Ağırlık, hacim ve adet birbirine çevrilemez.'},
 {title:'Kampanya şartı açık mı?',text:'Üyelik, minimum sepet, çoklu alım, uygulama, şehir ve geçerlilik tarihini fiyattan ayrı düşünme.'},
];

export default function MarketGuide(){return <>
 <section className="market-guide-hero"><div className="wrap market-guide-hero-inner">
  <div><span className="market-kicker"><span/> HAFTALIK ALIŞVERİŞ REHBERİ</span><h1>Fiyatı aynı ölçüye getir.<br/><em>Kararı kendin ver.</em></h1><p>Etiketteki tutarı, ürün miktarı ve kampanya koşuluyla birlikte değerlendir. Xucuz; kaynağı ve tarihi doğrulanmayan fiyatı teklif diye sunmaz.</p><ProductSearch total={products.length}/><div className="market-guide-actions"><Link className="btn" href="/birim-fiyat">Birim fiyatı hesapla <ArrowRight size={16}/></Link><Link className="market-text-link" href="#nasil-karsilastiriyoruz">Nasıl karşılaştırıyoruz?</Link></div></div>
  <aside className="market-guide-aside"><div className="market-guide-aside-mark"><Scale size={25}/></div><span>ÖNCE AYNI ÜRÜN</span><strong>Sonra aynı ölçü</strong><p>Kaynak · miktar · koşul · tarih</p><div className="market-guide-aside-rule"/><small>Teklif varsa, kontrol edebileceğin bilgilerle birlikte gösterilir.</small></aside>
 </div></section>

 <MarketOfferSection/>

 <section id="nasil-karsilastiriyoruz" className="market-guide-method"><div className="wrap">
  <div className="market-section-heading"><div><span className="market-kicker"><span/> XUCUZ’UN YÖNTEMİ</span><h2>Karşılaştırma için kısa kontrol listesi</h2><p>Bu adımlar ürünleri yanlışlıkla eşdeğer saymayı önler.</p></div></div>
  <div className="market-guide-checks">{checks.map((item,index)=><article key={item.title}><span className="market-guide-check-number">0{index+1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><Check size={18}/></article>)}</div>
 </div></section>

 <section className="wrap market-guide-content">
  <div className="market-guide-copy"><span className="market-kicker"><span/> BİRİM FİYAT NEDEN İŞE YARAR?</span><h2>Büyük paket her zaman daha hesaplı olmayabilir.</h2><p>Ürünlerin etiket fiyatı farklı miktarlardaysa toplam tutarı tek başına kıyaslamak yanıltabilir. Her ürünü ortak bir ölçüye çevirdiğinde, bir kilogramın, bir litrenin ya da bir adedin fiyatını görürsün. Bu hesap ürünlerin kalitesini, içeriğini veya kullanım farkını ölçmez; yalnızca girdiğin fiyat ve miktarı karşılaştırır.</p><p>Paketteki süzme miktar ile net miktar farklıysa ürüne uygun olan ölçüyü kullan. Birim fiyat sonucu, tek başına satın alma önerisi değildir.</p><Link href="/birim-fiyat" className="btn">Kendi fiyatlarını karşılaştır <ArrowRight size={16}/></Link></div>
  <aside className="market-guide-note"><ShieldCheck size={22}/><h3>Kaynak ve koşul görünür olmalı</h3><p>Her yayımlanan fiyatın kaynağı, son kontrol zamanı ve varsa bölge, stok, üyelik veya kampanya şartı açıklanır. Fiyat değişebilir; son tutarı satıcıda kontrol et.</p><Link href="/veri-kaynaklari" className="market-text-link">Veri kaynakları ve yöntem <ArrowRight size={15}/></Link></aside>
 </section>

 <section className="market-guide-disclosure"><div className="wrap"><strong>İçerik ve reklam açıklaması</strong><p>Metinler Xucuz için özgün hazırlanır. İzin doğrulanmadan katalog, reklam görseli veya ürün açıklaması kopyalanmaz. Affiliate ya da sponsorlu içerik varsa ayrıca belirtilir; ücretli görünürlük fiyat sıralamasını değiştirmez.</p><Link href="/affiliate">Affiliate ve sponsorlu içerik açıklaması →</Link></div></section>
</>;}

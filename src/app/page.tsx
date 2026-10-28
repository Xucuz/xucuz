import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowDown,ArrowRight,Check,Scale,ShieldCheck,Tag} from 'lucide-react';
import {products,productGroups} from '@/lib/products';
import {tools} from '@/lib/calculators';
import {ProductSearch} from '@/components/product-search';
import {MarketOfferSection} from '@/components/market-offer-section';

export const metadata:Metadata={title:'Haftalık market rehberi ve birim fiyat hesabı',description:'Market ürünlerini aynı ölçüde karşılaştır. Kaynağı, geçerlilik zamanı ve kampanya koşulları açıklanan haftalık alışveriş rehberi.',alternates:{canonical:'/'}};

const marketGroups=productGroups.filter(group=>['market','manav','sarkuteri','bakliyat','gida'].includes(group.slug));

export default function Home(){return <>
 <section className="market-home-hero">
  <div className="wrap market-home-grid">
   <div className="market-home-copy">
    <span className="market-kicker"><span/> ALMADAN ÖNCE GERÇEK MALİYETİ ÖĞREN</span>
    <h1>Etikete değil,<br/><em>birim fiyata bak.</em></h1>
    <p>Gramajı eşitle. Kampanya koşulunu oku. Gerçekten neye para verdiğini gör.</p>
    <ProductSearch total={products.length}/>
    <div className="market-home-actions"><Link href="/market-rehberi" className="btn">Haftalık market rehberi <ArrowRight size={17}/></Link><Link href="/birim-fiyat" className="market-text-link">Birim fiyatı hesapla <ArrowDown size={15}/></Link></div>
    <span className="market-search-caption">Ürün türü veya marka/model adı yaz; sana uygun alışveriş rehberini bul.</span>
   </div>
   <aside className="market-visual" aria-label="Fiyat karşılaştırma adımları">
    <div className="market-visual-top"><span>KIYASLAMADAN ÖNCE</span><span className="market-visual-mark"><Scale size={18}/></span></div>
    <div className="market-visual-row"><span className="market-visual-index">01</span><div><small>ÜRÜNÜ EŞLEŞTİR</small><strong>Aynı içerik mi?</strong></div><Check size={18}/></div>
    <div className="market-visual-row market-visual-focus"><span className="market-visual-index">02</span><div><small>MİKTARI EŞİTLE</small><strong>Kg · litre · adet</strong></div><span className="market-equals">=</span></div>
    <div className="market-visual-row"><span className="market-visual-index">03</span><div><small>KOŞULU KONTROL ET</small><strong>Hangi tarihte, nerede?</strong></div><Check size={18}/></div>
    <div className="market-visual-note"><Tag size={15}/> Fiyat kadar paket ve kampanya şartı da önemli.</div>
   </aside>
  </div>
 </section>

 <MarketOfferSection/>

 <section className="market-method-band">
  <div className="wrap market-method-inner">
   <div><span className="market-kicker"><span/> XUCUZ NASIL KIYASLAR?</span><h2>Önce aynı ürünü,<br/>sonra aynı ölçüyü karşılaştır.</h2><p>Farklı gramajı, içeriği veya kampanya koşulunu eşdeğer gibi göstermeyiz.</p></div>
   <div className="market-method-steps">
    <article><b>1</b><div><h3>Kaynağı göster</h3><p>Fiyatın geldiği sayfa ve son kontrol zamanı görünür.</p></div></article>
    <article><b>2</b><div><h3>Paketleri eşitle</h3><p>Gramaj, litre, adet ve paket sayısını ayrı değerlendir.</p></div></article>
    <article><b>3</b><div><h3>Koşulları açıkla</h3><p>Üyelik, çoklu alım, şehir ve tarih şartlarını belirt.</p></div></article>
   </div>
  </div>
 </section>

 <section className="wrap market-category-section">
  <div className="market-section-heading"><div><span className="market-kicker"><span/> İHTİYACINDAN BAŞLA</span><h2>Hangi ürünü araştırıyorsun?</h2><p>Ürün türüne özel rehber ve kontrol listelerine göz at.</p></div><Link href="/urunler" className="market-text-link">Tüm ürün rehberleri <ArrowRight size={16}/></Link></div>
  <div className="market-category-grid">{marketGroups.map((group,index)=><Link href={`/urunler?kategori=${group.slug}`} className="market-category-card" key={group.slug}><span>0{index+1}</span><h3>{group.label}</h3><p>{group.topic}</p><ArrowRight size={18}/></Link>)}</div>
 </section>

 <section className="market-tools-band">
  <div className="wrap">
   <div className="market-section-heading"><div><span className="market-kicker"><span/> HESABI KENDİN YAP</span><h2>Fiyatı gir, hesabı gör.</h2><p>Gerçek satıcı fiyatı sunmuyoruz; kendi gördüğün fiyatlarla karşılaştır.</p></div></div>
   <div className="market-tool-grid">{tools.map((tool,index)=><Link href={`/${tool.slug}`} className="market-tool-card" key={tool.slug}><span className="market-tool-number">0{index+1}</span><h3>{tool.title}</h3><p>{tool.description}</p><span className="market-text-link">Hesaplamayı aç <ArrowRight size={15}/></span></Link>)}</div>
  </div>
 </section>

 <section className="wrap market-transparency">
  <div className="market-transparency-icon"><ShieldCheck size={24}/></div>
  <div><span className="market-kicker"><span/> AÇIK VE ÖZGÜN BİLGİ</span><h2>Kaynağı yoksa fiyatı da yok.</h2><p>Market görsellerini ve katalog metinlerini kopyalamayız. Yalnızca yayımlama koşulu doğrulanmış fiyatları; kaynağı, tarihi ve geçerlilik şartıyla gösteririz. Affiliate veya sponsorlu içerik olursa ayrıca işaretleriz.</p><Link href="/market-rehberi" className="market-text-link">Rehberin yöntemini oku <ArrowRight size={16}/></Link></div>
 </section>
</>;}

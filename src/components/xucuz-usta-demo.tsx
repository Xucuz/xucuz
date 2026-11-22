'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import {ArrowRight,Camera,Check,ChevronDown,Clock3,MapPin,Plus,Search,ShieldCheck,Sparkles,Star,Wrench,X} from 'lucide-react';

const services=[
  {name:'Boya & badana',icon:'🎨',count:'Duvar, tavan, kapı'},
  {name:'Su tesisatı',icon:'🚰',count:'Musluk, kaçak, gider'},
  {name:'Elektrik',icon:'⚡',count:'Priz, aydınlatma, arıza'},
  {name:'Montaj & mobilya',icon:'🪑',count:'Mobilya, raf, perde'},
  {name:'Fayans & parke',icon:'🧱',count:'Döşeme, derz, onarım'},
  {name:'Temizlik',icon:'🧽',count:'Ev, koltuk, taşınma'},
  {name:'Beyaz eşya',icon:'🧺',count:'Bakım ve teknik servis'},
  {name:'Klima',icon:'❄️',count:'Montaj, bakım, temizlik'},
  {name:'Kapı & pencere',icon:'🚪',count:'Tamir, ayar, sineklik'},
  {name:'Bahçe işleri',icon:'🌿',count:'Budama, bakım, düzenleme'},
  {name:'Terzi & ayakkabı',icon:'🧵',count:'Tadilat ve küçük onarım'},
  {name:'Diğer ince işler',icon:'🛠️',count:'İşini tarif et, usta bul'},
];

const examples=[
  {service:'Boya & badana',title:'Salon duvarlarının boyanması',place:'Örnek konum · Çankaya',detail:'Yaklaşık 25 m² salon, boya kullanıcıdan',when:'Örnek tarih · Önümüzdeki hafta',tone:'blue'},
  {service:'Su tesisatı',title:'Mutfak bataryası değişimi',place:'Örnek konum · Kadıköy',detail:'Mevcut batarya sökülecek, yenisi takılacak',when:'Örnek tarih · Esnek',tone:'mint'},
  {service:'Montaj & mobilya',title:'Gardırop kurulumu',place:'Örnek konum · Nilüfer',detail:'3 kapılı demonte ürün, montaj desteği',when:'Örnek tarih · Hafta sonu',tone:'gold'},
];

export function XucuzUstaDemo(){
  const [selected,setSelected]=useState('Tüm hizmetler');
  const [query,setQuery]=useState('');
  const [city,setCity]=useState('');
  const [district,setDistrict]=useState('');
  const [formOpen,setFormOpen]=useState(false);
  const [sent,setSent]=useState(false);
  const visibleExamples=useMemo(()=>examples.filter(item=>{
    const matchesService=selected==='Tüm hizmetler'||item.service===selected;
    const needle=query.trim().toLocaleLowerCase('tr-TR');
    const matchesText=!needle||`${item.title} ${item.service} ${item.detail}`.toLocaleLowerCase('tr-TR').includes(needle);
    return matchesService&&matchesText;
  }),[selected,query]);

  function openRequest(service?:string){
    if(service&&services.some(item=>item.name===service))setSelected(service);
    setSent(false);setFormOpen(true);
  }

  return <div className="xusta-page">
    <section className="xusta-hero">
      <div className="xusta-hero-copy">
        <Link href="/" className="xusta-back">← Xucuz ana sayfa</Link>
        <span className="xusta-eyebrow"><Sparkles size={14}/> YEREL HİZMETLER · ÖRNEK PLATFORM</span>
        <h1>İşini anlat.<br/><em>Uygun ustalardan</em> teklif al.</h1>
        <p>Evdeki küçük tamirden montaja, temizlikten teknik servise kadar ince işçilikler tek yerde.</p>
        <form className="xusta-search" onSubmit={event=>{event.preventDefault();document.getElementById('xusta-examples')?.scrollIntoView({behavior:'smooth'});}}>
          <Search size={19}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Hangi iş için usta arıyorsun?" aria-label="Hizmet ara"/>
          <button type="submit">Hizmet ara <ArrowRight size={16}/></button>
        </form>
        <div className="xusta-location-row">
          <label><MapPin size={15}/><select aria-label="İl seç" value={city} onChange={event=>{setCity(event.target.value);setDistrict('');}}><option value="">İl seç</option><option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Bursa</option></select><ChevronDown size={13}/></label>
          <label><select aria-label="İlçe seç" value={district} onChange={event=>setDistrict(event.target.value)} disabled={!city}><option value="">İlçe seç</option>{(city==='İstanbul'?['Kadıköy','Üsküdar','Beşiktaş','Ataşehir']:city==='Ankara'?['Çankaya','Keçiören','Yenimahalle']:city==='İzmir'?['Karşıyaka','Bornova','Konak']:city==='Bursa'?['Nilüfer','Osmangazi','Yıldırım']:[]).map(item=><option key={item}>{item}</option>)}</select><ChevronDown size={13}/></label>
        </div>
        <button className="xusta-primary-cta" type="button" onClick={()=>openRequest()}><Plus size={17}/> Ücretsiz iş talebi oluştur</button>
        <small className="xusta-form-note">Örnek sürüm · Talep gerçek ustalara gönderilmez.</small>
      </div>
      <div className="xusta-hero-visual" aria-label="Xucuz Usta iş akışı">
        <div className="xusta-visual-glow"/>
        <div className="xusta-visual-brand"><span>✦</span><div><strong>XUCUZ USTA</strong><small>İşin ustasını bul</small></div></div>
        <div className="xusta-visual-card xusta-visual-request"><span>1 · İŞİNİ ANLAT</span><strong>Lavabo bataryası değişimi</strong><small><MapPin size={12}/> İlçe seçimini ekle</small></div>
        <div className="xusta-visual-connector"><i/><i/><i/></div>
        <div className="xusta-visual-card xusta-visual-offer"><span>2 · TEKLİFLERİ KARŞILAŞTIR</span><div><b>Usta teklifi</b><strong>₺ —</strong></div><small>Gerçek teklif bu örnekte yok</small></div>
        <div className="xusta-demo-stamp">DEMO TASARIM</div>
      </div>
    </section>

    <div className="xusta-demo-banner"><ShieldCheck size={16}/><span className="xusta-live-dot"/> Canlı hizmet yok
    </div>

    <section className="xusta-section xusta-services-section">
      <div className="xusta-section-head"><div><span className="xusta-eyebrow">NEYE İHTİYACIN VAR?</span><h2>Her ince iş için bir kategori.</h2><p>Hizmet seç, işini kısaca anlat; teklifler gelince karşılaştır.</p></div><button type="button" className="xusta-text-link" onClick={()=>openRequest()}>Tüm hizmetler <ArrowRight size={16}/></button></div>
      <div className="xusta-service-grid">{services.map((service,index)=><button type="button" onClick={()=>openRequest(service.name)} className="xusta-service-card" key={service.name}><span className={`xusta-service-icon tone-${index%5}`}>{service.icon}</span><strong>{service.name}</strong><small>{service.count}</small><ArrowRight className="xusta-service-arrow" size={15}/></button>)}</div>
    </section>

    <section className="xusta-process-section">
      <div className="xusta-section-head"><div><span className="xusta-eyebrow">3 KOLAY ADIM</span><h2>Usta bulmak bu kadar kolay.</h2></div></div>
      <div className="xusta-steps"><article><span>01</span><div className="xusta-step-icon"><ClipboardIcon/></div><h3>İşini tarif et</h3><p>Ne yapılacağını, nerede ve ne zaman gerektiğini yaz. İstersen fotoğraf ekle.</p></article><article><span>02</span><div className="xusta-step-icon"><Sparkles size={23}/></div><h3>Teklifleri incele</h3><p>Ustaların fiyatını, kapsamını ve müsaitlik bilgisini yan yana karşılaştır.</p></article><article><span>03</span><div className="xusta-step-icon"><Check size={23}/></div><h3>Sana uygun olanı seç</h3><p>İş başlamadan önce fiyatı ve yapılacakları usta ile netleştir.</p></article></div>
    </section>

    <section className="xusta-section xusta-examples-section" id="xusta-examples">
      <div className="xusta-section-head"><div><span className="xusta-eyebrow">ÖRNEK TALEPLER · GERÇEK DEĞİL</span><h2>İş talebi nasıl görünür?</h2><p>Bu kartlar yalnızca platform örneğidir; gerçek müşteri veya iş ilanı değildir.</p></div><span className="xusta-sample-count">{visibleExamples.length} örnek</span></div>
      <div className="xusta-example-filters"><label><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Örnek işleri ara" aria-label="Örnek işleri ara"/></label><label><MapPin size={16}/><select value={selected} onChange={event=>setSelected(event.target.value)} aria-label="Hizmet türüne göre filtrele"><option>Tüm hizmetler</option>{services.map(service=><option key={service.name}>{service.name}</option>)}</select></label></div>
      <div className="xusta-example-list">{visibleExamples.length?visibleExamples.map(item=><article className="xusta-example-card" key={item.title}><div className={`xusta-example-icon ${item.tone}`}><Wrench size={20}/></div><div className="xusta-example-content"><span className="xusta-sample-tag">ÖRNEK TALEP</span><h3>{item.title}</h3><p>{item.detail}</p><div className="xusta-example-meta"><span><MapPin size={13}/>{item.place}</span><span><Clock3 size={13}/>{item.when}</span></div></div><button type="button" className="xusta-offer-button" onClick={()=>openRequest(item.service)}>Usta çağır <ArrowRight size={15}/></button></article>):<p className="xusta-no-results">Bu filtrelerle örnek talep yok. Başka hizmet seçebilir veya kendi örnek talebini oluşturabilirsin.</p>}</div>
    </section>

    <section className="xusta-trust-band"><div><span className="xusta-eyebrow">GÜVENLİ HİZMET PAZARYERİ</span><h2>İyi iş, açık iletişimle başlar.</h2><p>Gerçek platformda doğrulanmış usta profilleri, şeffaf teklifler, güvenli mesajlaşma ve iş tamamlandıktan sonra yorumlar yer alacak.</p></div><div className="xusta-trust-points"><p><ShieldCheck size={18}/> Usta kimlik ve yetkinlik kontrolü</p><p><Check size={18}/> İş başlamadan net teklif</p><p><Star size={18}/> Yalnızca tamamlanan işe yorum</p><p><Camera size={18}/> İş öncesi/sonrası fotoğraf alanı</p></div></section>

    {formOpen&&<div className="xusta-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setFormOpen(false);}}><section className="xusta-modal" role="dialog" aria-modal="true" aria-labelledby="xusta-modal-title"><button type="button" className="xusta-modal-close" aria-label="Pencereyi kapat" onClick={()=>setFormOpen(false)}><X size={20}/></button>{sent?<div className="xusta-sent-state"><span><Check size={24}/></span><h2 id="xusta-modal-title">Örnek talebin hazır</h2><p>Bu demo sürümünde talep kaydedilmez ve gerçek ustalara gönderilmez.</p><button type="button" onClick={()=>setFormOpen(false)}>Tamam</button></div>:<><span className="xusta-eyebrow">DEMO · GÖNDERİM KAPALI</span><h2 id="xusta-modal-title">Yapılacak işi anlat</h2><p className="xusta-modal-intro">Formu doldurarak talep akışının örneğini görebilirsin. Bilgiler sunucuya gönderilmez.</p><form onSubmit={event=>{event.preventDefault();setSent(true);}}><label>Hizmet türü<select defaultValue={selected==='Tüm hizmetler'?'':selected} required><option value="" disabled>Hizmet seç</option>{services.map(service=><option key={service.name}>{service.name}</option>)}</select></label><label>İşin kısa açıklaması<input required minLength={8} placeholder="Örn. salondaki duvarları boyatmak istiyorum"/></label><label>İl ve ilçe<input required placeholder="Örn. Ankara, Çankaya" defaultValue={city?`${city}${district?`, ${district}`:''}`:''}/></label><label>Ne zaman yapılmalı?<select defaultValue="Esnek"><option>Esnek</option><option>Bu hafta</option><option>Belirli bir gün</option></select></label><label className="xusta-photo-input"><Camera size={17}/> Fotoğraf ekleme alanı <small>(örnek arayüz)</small><input type="file" accept="image/*" disabled aria-label="Demo sürümünde fotoğraf yükleme kapalı"/></label><button type="submit" className="xusta-submit">Örnek talebi önizle <ArrowRight size={16}/></button><small className="xusta-modal-disclaimer">Gönderim kapalı · hiçbir bilgi kaydedilmez veya ustaya iletilmez.</small></form></>}</section></div>}
  </div>;
}

function ClipboardIcon(){return <span className="xusta-clipboard-emoji" aria-hidden="true">📝</span>;}

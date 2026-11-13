'use client';
import {useState} from 'react';
import Link from 'next/link';
import {normalizeTurkishMobile} from '@/lib/phone-lookup/normalize';
import {PhoneReportDemo,VerifiedBusinessDemo} from '@/components/phone-report-demo';

export function PhoneLookupDemo(){
  const [input,setInput]=useState('');
  const [status,setStatus]=useState<'idle'|'invalid'|'demo'>('idle');
  function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setStatus(normalizeTurkishMobile(input)?'demo':'invalid');
  }
  return <section className="wrap" style={{maxWidth:720,padding:'48px 0 80px'}}>
    <div role="status" style={{background:'#fff1bd',border:'1px solid #d4a600',borderRadius:10,padding:16,marginBottom:24}}>
      <strong>GELİŞTİRME DEMOSU — gerçek sorgulama yapılmaz.</strong>
      <p style={{margin:'6px 0 0'}}>Girilen numara yalnızca tarayıcıda biçim kontrolünden geçer. Sunucuya gönderilmez, kaydedilmez veya üçüncü taraflarla paylaşılmaz.</p>
    </div>
    <h1>Kim arıyor?</h1>
    <p>Bilinmeyen numaraları araştırmak için hazırlanan güvenli Xucuz modülünün ilk taslağı.</p>
    <form onSubmit={submit} style={{display:'grid',gap:12,marginTop:24}}>
      <label htmlFor="phone-demo-input" style={{fontWeight:700}}>Türkiye cep telefonu numarası</label>
      <input id="phone-demo-input" type="tel" autoComplete="off" inputMode="tel" maxLength={24}
        value={input} onChange={event=>{setInput(event.target.value);setStatus('idle');}}
        placeholder="05XX XXX XX XX" aria-describedby="phone-demo-help"
        style={{border:'1px solid #b5b5b5',borderRadius:8,padding:14,width:'100%'}}/>
      <p id="phone-demo-help" style={{fontSize:12,margin:0}}>Lütfen gerçek bir kişinin numarasını kullanmayın; örnek biçim: 05XX XXX XX XX.</p>
      <button className="btn" type="submit" style={{width:'fit-content'}}>Biçimi kontrol et</button>
    </form>
    {status==='invalid'&&<p role="alert" style={{marginTop:20}}>Geçerli bir Türkiye cep telefonu numarası biçimi girin.</p>}
    {status==='demo'&&<div role="status" style={{marginTop:24,border:'1px solid #e5e2d8',borderRadius:12,padding:20}}>
      <h2 style={{fontSize:22}}>Demo sonucu</h2>
      <p>Numara biçimi geçerli. <strong>Numara sahibi, operatör veya spam durumu sorgulanmadı.</strong></p>
      <p>Gerçek veri bağlantısı ve izinli profil sistemi henüz geliştirilmedi.</p>
    </div>}
    <p style={{marginTop:18,fontSize:13}}><Link href="/numara-sorgulama/gizlilik" style={{textDecoration:'underline'}}>Gizlilik ve haklar hakkında bilgi</Link></p>
    <PhoneReportDemo/>
    <VerifiedBusinessDemo/>
    <div style={{marginTop:36}}>
      <h2 style={{fontSize:22}}>Planlanan özellikler</h2>
      <ul style={{lineHeight:2}}>
        <li>İzinli ve doğrulanmış işletme profilleri</li>
        <li>Moderasyonlu spam bildirimleri</li>
        <li>Numara sahipliği ve yayımlama izni kontrolü</li>
        <li>KVKK erişim, düzeltme ve silme talepleri</li>
      </ul>
    </div>
  </section>;
}

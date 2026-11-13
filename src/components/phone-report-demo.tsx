'use client';
import {useState} from 'react';
import {createReportDraft} from '@/lib/phone-lookup/report-policy';

const reportKinds=[
  {value:'unwanted',label:'İstenmeyen arama'},
  {value:'advertising',label:'Reklam / pazarlama'},
  {value:'suspicious',label:'Şüpheli arama'},
] as const;

export function PhoneReportDemo(){
  const [kind,setKind]=useState<string>('unwanted');
  const [preview,setPreview]=useState(false);
  return <section aria-labelledby="report-demo-title" style={{marginTop:36,border:'1px solid #e5e2d8',borderRadius:12,padding:20}}>
    <h2 id="report-demo-title" style={{fontSize:22}}>Spam bildirimi — demo</h2>
    <p>Bu alan sadece arayüzün nasıl çalışacağını gösterir. Gerçek bildirim göndermez, numara veya kişi bilgisi kaydetmez.</p>
    <form onSubmit={event=>{event.preventDefault();setPreview(createReportDraft(kind)!==null);}} style={{display:'grid',gap:12}}>
      <label htmlFor="report-kind" style={{fontWeight:700}}>Bildirim kategorisi</label>
      <select id="report-kind" value={kind} onChange={event=>{setKind(event.target.value);setPreview(false);}}
        style={{padding:12,border:'1px solid #b5b5b5',borderRadius:8}}>
        {reportKinds.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <button className="btn btn-outline" type="submit" style={{width:'fit-content'}}>Bildirim önizlemesi</button>
    </form>
    {preview&&<div role="status" style={{marginTop:16,padding:14,background:'#f6f6f1',borderRadius:8}}>
      <strong>Örnek bildirim: {reportKinds.find(item=>item.value===kind)?.label}</strong>
      <p style={{margin:'6px 0 0'}}>Gönderilmedi. Gerçek sürümde inceleme ve itiraz süreçleri tamamlanmadan kamuya açık suçlama yayımlanmayacak.</p>
    </div>}
  </section>;
}

export function VerifiedBusinessDemo(){
  return <section aria-labelledby="business-demo-title" style={{marginTop:36,border:'1px solid #e5e2d8',borderRadius:12,padding:20}}>
    <h2 id="business-demo-title" style={{fontSize:22}}>Doğrulanmış işletmeler</h2>
    <p>Henüz doğrulanmış işletme kaydı bulunmuyor. İşletme adları ve numaraları, yetki ve yayımlama izni doğrulanmadan gösterilmeyecek.</p>
    <p style={{fontSize:12}}>Bu geliştirme ekranında gerçek işletme veya telefon numarası verisi kullanılmaz.</p>
  </section>;
}

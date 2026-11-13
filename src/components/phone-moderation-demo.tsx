'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {ModerationState,ReportCategory} from '@/lib/phone-lookup/report-policy';
import {applyModerationDecision} from '@/lib/phone-lookup/moderation';

type DemoReport={id:string;category:ReportCategory;state:ModerationState};
const initialReports:DemoReport[]=[
  {id:'DEMO-001',category:'unwanted',state:'pending'},
  {id:'DEMO-002',category:'advertising',state:'pending'},
  {id:'DEMO-003',category:'suspicious',state:'rejected'},
];
const categoryLabels:Record<ReportCategory,string>={
  unwanted:'İstenmeyen arama',advertising:'Reklam / pazarlama',suspicious:'Şüpheli arama'
};
const stateLabels:Record<ModerationState,string>={
  pending:'İnceleme bekliyor',approved:'Onaylandı (yalnızca demo)',rejected:'Reddedildi'
};

export function PhoneModerationDemo(){
  const [reports,setReports]=useState<DemoReport[]>(initialReports);
  const [filter,setFilter]=useState<ModerationState|'all'>('all');
  const visible=reports.filter(report=>filter==='all'||report.state===filter);
  function update(id:string,state:ModerationState){
    setReports(previous=>previous.map(report=>report.id===id?{...report,state:applyModerationDecision(report.state,state as 'approved'|'rejected')??report.state}:report));
  }
  return <section className="wrap" style={{maxWidth:850,padding:'48px 0 80px'}}>
    <p><Link href="/admin" style={{textDecoration:'underline'}}>← Yönetim</Link></p>
    <h1>Telefon bildirimleri</h1>
    <div role="status" style={{padding:16,border:'1px solid #d4a600',borderRadius:10,background:'#fff1bd',marginBottom:24}}>
      <strong>Yalnızca geliştirme demosu.</strong>
      <p style={{margin:'6px 0 0'}}>Bu kayıtlar tamamen kurgusaldır. Kararlar sadece tarayıcı belleğinde tutulur; sunucuya gönderilmez, veritabanına kaydedilmez ve kamuya yayımlanmaz.</p>
    </div>
    <label htmlFor="phone-moderation-filter" style={{fontWeight:700}}>Bildirim durumu</label>
    <select id="phone-moderation-filter" value={filter} onChange={event=>setFilter(event.target.value as ModerationState|'all')}
      style={{display:'block',padding:12,margin:'8px 0 20px',border:'1px solid #b5b5b5',borderRadius:8}}>
      <option value="all">Tümü</option><option value="pending">İnceleme bekliyor</option>
      <option value="approved">Onaylandı</option><option value="rejected">Reddedildi</option>
    </select>
    {visible.length===0?<p>Bu filtrede örnek kayıt yok.</p>:<ul style={{listStyle:'none',padding:0,display:'grid',gap:12}}>
      {visible.map(report=><li key={report.id} style={{border:'1px solid #e5e2d8',borderRadius:10,padding:18}}>
        <strong>{report.id} — {categoryLabels[report.category]}</strong>
        <p style={{margin:'8px 0'}}>Durum: {stateLabels[report.state]}</p>
        {report.state==='pending'&&<div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button type="button" className="btn" onClick={()=>update(report.id,'approved')}>Örneği onayla</button>
          <button type="button" className="btn btn-outline" onClick={()=>update(report.id,'rejected')}>Örneği reddet</button>
        </div>}
      </li>)}
    </ul>}
    <button type="button" className="btn btn-outline" style={{marginTop:20}} onClick={()=>{setReports(initialReports);setFilter('all');}}>Demoyu sıfırla</button>
  </section>;
}

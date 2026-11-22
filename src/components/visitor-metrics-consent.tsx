'use client';
import {useEffect,useState} from 'react';

const CONSENT='xucuz-visitor-metrics-consent';
const ID='xucuz-visitor-metrics-id';
const LAST_SENT='xucuz-visitor-metrics-last-sent';
export function VisitorMetricsConsent(){
 const [choice,setChoice]=useState<'pending'|'accepted'|'rejected'>('pending');
 useEffect(()=>{
  const saved=localStorage.getItem(CONSENT);
  if(saved==='accepted'||saved==='rejected'){const timer=window.setTimeout(()=>setChoice(saved),0);return()=>window.clearTimeout(timer);}
 },[]);
 useEffect(()=>{
  if(choice!=='accepted')return;
  const period=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(localStorage.getItem(LAST_SENT)===period)return;
  let id=localStorage.getItem(ID);
  if(!id){id=crypto.randomUUID();localStorage.setItem(ID,id);}
  void fetch('/api/visitors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,consent:true}),keepalive:true})
   .then(response=>{if(response.ok)localStorage.setItem(LAST_SENT,period);})
   .catch(()=>{});
 },[choice]);
 function decide(value:'accepted'|'rejected'){localStorage.setItem(CONSENT,value);setChoice(value);}
 if(choice!=='pending')return null;
 return <aside className="visitor-consent" aria-label="Anonim ziyaretçi ölçümü tercihi"><p>Günlük tekil ziyaretçi sayımına anonim olarak katılmak ister misin? Kimlik bilgisi veya iletişim bilgisi saklanmaz.</p><div><button type="button" onClick={()=>decide('accepted')}>Kabul et</button><button type="button" onClick={()=>decide('rejected')}>Reddet</button></div></aside>;
}

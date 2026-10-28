'use client';

import {FormEvent,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {MessageCircle,Send, X} from 'lucide-react';
import type {QaReply} from '@/lib/qa';

type Message={id:number;from:'assistant'|'visitor';reply:QaReply};

const welcome='Merhaba! Ürün seçimi, birim fiyat, kampanya hesabı ve gerçek maliyet hakkında sorularını yanıtlayabilirim. Güncel fiyat uydurmam; gösterilen tekliflerin kaynağını ve tarihini kontrol et.';

export function LiveQA(){
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState<Message[]>([{id:0,from:'assistant',reply:{text:welcome}}]);
 const [busy,setBusy]=useState(false);
 const list=useRef<HTMLDivElement>(null);
 const nextId=useRef(1);

 useEffect(()=>{if(open)list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'});},[messages,open,busy]);

 function send(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const question=input.trim().slice(0,300);
  if(!question||busy)return;
  const visitor:Message={id:nextId.current++,from:'visitor',reply:{text:question}};
  setMessages(current=>[...current,visitor]);
  setInput('');
  setBusy(true);
  window.setTimeout(async()=>{
   let reply:QaReply;
   try{const response=await fetch('/api/qa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});const body=await response.json() as QaReply|{error:string};reply=response.ok&&'text'in body?body:{text:'Şu an yanıt veremedim. Biraz sonra yeniden dene ya da bize yaz.',href:'/iletisim',label:'İletişim sayfası'};}
   catch{reply={text:'Bağlantı kurulamadı. Biraz sonra yeniden deneyebilir ya da bize yazabilirsin.',href:'/iletisim',label:'İletişim sayfası'};}
   const answer:Message={id:nextId.current++,from:'assistant',reply};
   setMessages(current=>[...current,answer]);
   setBusy(false);
  },160);
 }

 return <div className="live-qa-root">
  {open&&<section className="live-qa-panel" aria-label="Xucuz soru cevap">
   <header className="live-qa-head"><div><strong>Xucuz Soru-Cevap</strong><span>Otomatik rehber yanıtları</span></div><button type="button" className="live-qa-close" onClick={()=>setOpen(false)} aria-label="Sohbeti kapat"><X size={20}/></button></header>
   <div className="live-qa-messages" ref={list} aria-live="polite" aria-relevant="additions text">
    {messages.map(message=><div className={`live-qa-message ${message.from}`} key={message.id}><p>{message.reply.text}</p>{message.reply.href&&message.reply.label&&<Link href={message.reply.href} onClick={()=>setOpen(false)}>{message.reply.label} →</Link>}</div>)}
    {busy&&<div className="live-qa-message assistant" aria-label="Yanıt hazırlanıyor"><p className="live-qa-typing">•••</p></div>}
   </div>
   <div className="live-qa-prompts"><button type="button" onClick={()=>setInput('Birim fiyatı nasıl karşılaştırırım?')}>Birim fiyat</button><button type="button" onClick={()=>setInput('Gerçek maliyeti nasıl hesaplarım?')}>Gerçek maliyet</button></div>
   <form className="live-qa-form" onSubmit={send}><label className="sr-only" htmlFor="live-qa-input">Sorunu yaz</label><textarea id="live-qa-input" value={input} onChange={event=>setInput(event.target.value.slice(0,300))} placeholder="Sorunu buraya yaz…" rows={1} maxLength={300} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}}/><button type="submit" aria-label="Soruyu gönder" disabled={!input.trim()||busy}><Send size={18}/></button></form>
   <p className="live-qa-note">Yanıtlar rehber içeriklerine dayanır; insan temsilci veya canlı fiyat bağlantısı değildir. Mesajlar bu oturumda tutulur.</p>
  </section>}
  <button type="button" className={`live-qa-launcher ${open?'is-open':''}`} onClick={()=>setOpen(value=>!value)} aria-label={open?'Soru-cevap penceresini kapat':'Soru sor'} aria-expanded={open}><MessageCircle size={21}/><span>{open?'Kapat':'Soru sor'}</span></button>
 </div>;
}

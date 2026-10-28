'use client';

import {FormEvent,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Mic,Send,Sparkles,Volume2,X} from 'lucide-react';
import type {QaReply} from '@/lib/qa';
import {useLanguage} from './language-provider';

type Message={id:number;from:'assistant'|'visitor';reply:QaReply};
type SpeechResult=Event&{results:ArrayLike<ArrayLike<{transcript:string}>>};
type Recognition={lang:string;interimResults:boolean;onresult:((event:SpeechResult)=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};
type RecognitionCtor=new()=>Recognition;
const welcomes={tr:'Merhaba! Ürün seçimi, birim fiyat ve gerçek maliyet konusunda rehberlerden yanıt bulmana yardım ederim. Güncel fiyat uydurmam.',en:'Hello! I can help you find guide-based answers about product choices, unit prices and total cost. I never invent current prices.',ru:'Здравствуйте! Я помогу найти ответы в руководствах о выборе товаров, цене за единицу и полной стоимости. Я не придумываю актуальные цены.'};

export function LiveQA(){
 const {language,t}=useLanguage();
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState<Message[]>([{id:0,from:'assistant',reply:{text:welcomes[language]}}]);
 const [busy,setBusy]=useState(false);
 const [listening,setListening]=useState(false);
 const list=useRef<HTMLDivElement>(null);
 const nextId=useRef(1);

 useEffect(()=>{if(open)list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'});},[messages,open,busy]);

 function listen(){const scope=window as unknown as {SpeechRecognition?:RecognitionCtor;webkitSpeechRecognition?:RecognitionCtor};const Constructor=scope.SpeechRecognition??scope.webkitSpeechRecognition;if(!Constructor){setMessages(current=>[...current,{id:nextId.current++,from:'assistant',reply:{text:'Bu tarayıcı sesle yazmayı desteklemiyor. Sorunu metin olarak yazabilirsin.'}}]);return;}const recognition=new Constructor();recognition.lang=language==='tr'?'tr-TR':language==='ru'?'ru-RU':'en-US';recognition.interimResults=false;recognition.onresult=event=>setInput(event.results[0]?.[0]?.transcript?.slice(0,300)??'');recognition.onerror=()=>setListening(false);recognition.onend=()=>setListening(false);setListening(true);recognition.start();}
 function speak(text:string){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=language==='tr'?'tr-TR':language==='ru'?'ru-RU':'en-US';window.speechSynthesis.speak(utterance);}

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
   try{const response=await fetch('/api/qa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,language})});const body=await response.json() as QaReply|{error:string};reply=response.ok&&'text'in body?body:{text:'Şu an yanıt veremedim. Biraz sonra yeniden dene ya da bize yaz.',href:'/iletisim',label:'İletişim sayfası'};}
   catch{reply={text:'Bağlantı kurulamadı. Biraz sonra yeniden deneyebilir ya da bize yazabilirsin.',href:'/iletisim',label:'İletişim sayfası'};}
   const answer:Message={id:nextId.current++,from:'assistant',reply};
   setMessages(current=>[...current,answer]);
   setBusy(false);
  },160);
 }

 return <div className="live-qa-root">
  {open&&<section className="live-qa-panel" aria-label="Xucuz soru cevap">
  <header className="live-qa-head"><div className="xucina-avatar" aria-hidden="true"><Image src="/xucina-icon-192.png" alt="" fill sizes="40px"/></div><div><strong>Xucina</strong><span>{t('online')}</span></div><button type="button" className="live-qa-close" onClick={()=>setOpen(false)} aria-label="Sohbeti kapat"><X size={20}/></button></header>
   <div className="live-qa-messages" ref={list} aria-live="polite" aria-relevant="additions text">
    {messages.map(message=><div className={`live-qa-message ${message.from}`} key={message.id}><p>{message.id===0?welcomes[language]:message.reply.text}</p>{message.from==='assistant'&&<button className="xucina-speak" type="button" onClick={()=>speak(message.reply.text)} aria-label={t('speak')}><Volume2 size={14}/>{t('speak')}</button>}{message.reply.href&&message.reply.label&&<Link href={message.reply.href} onClick={()=>setOpen(false)}>{message.reply.label} →</Link>}</div>)}
    {busy&&<div className="live-qa-message assistant" aria-label="Yanıt hazırlanıyor"><p className="live-qa-typing">•••</p></div>}
   </div>
   <div className="live-qa-prompts"><button type="button" onClick={()=>setInput('Birim fiyatı nasıl karşılaştırırım?')}>{t('perUnit')}</button><button type="button" onClick={()=>setInput('Gerçek maliyeti nasıl hesaplarım?')}>Toplam maliyet</button></div>
   <form className="live-qa-form" onSubmit={send}><label className="sr-only" htmlFor="live-qa-input">{t('ask')}</label><textarea id="live-qa-input" value={input} onChange={event=>setInput(event.target.value.slice(0,300))} placeholder={t('ask')} rows={1} maxLength={300} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}}/><button type="button" onClick={listen} aria-label={t('listen')} title={t('listen')}><Mic size={17}/></button><button type="submit" aria-label={t('sendQuestion')} disabled={!input.trim()||busy}><Send size={18}/></button></form>
   <p className="live-qa-note">{t('xucinaIntro')} {listening?t('listening'):''}</p>
  </section>}
  <button type="button" className={`live-qa-launcher ${open?'is-open':''}`} onClick={()=>setOpen(value=>!value)} aria-label={open?'Xucina penceresini kapat':t('xucina')} aria-expanded={open}><Sparkles size={21}/><span>{open?'Kapat':t('xucina')}</span></button>
 </div>;
}

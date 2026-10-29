'use client';

import {FormEvent,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Mic,Send,Sparkles,Volume2,X} from 'lucide-react';
import type {QaReply} from '@/lib/qa';
import {useLanguage} from './language-provider';

type Message={id:number;from:'assistant'|'visitor';reply:QaReply};
type SpeechResult=Event&{results:ArrayLike<ArrayLike<{transcript:string}>>};
type SpeechError=Event&{error:string};
type Recognition={lang:string;interimResults:boolean;onresult:((event:SpeechResult)=>void)|null;onerror:((event:SpeechError)=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};
type RecognitionCtor=new()=>Recognition;
const welcomes={tr:'Merhaba! Ürün seçimi ve alışveriş rehberlerinde yardımcı olabilirim. Fiyat sorularında yalnızca veritabanındaki güncel, yönetici onaylı gözlemleri paylaşırım; fiyat uydurmam.',en:'Hello! I can help with product choices and shopping guides. For price questions, I only share current, moderator-approved database observations; I never invent prices.',ru:'Здравствуйте! Я помогу с выбором товара и руководствами. В ответах о ценах я использую только актуальные записи из базы, проверенные модератором. Я не придумываю цены.'};
const speechLocale={tr:'tr-TR',en:'en-US',ru:'ru-RU'} as const;
const femaleVoiceHints=/samantha|victoria|karen|zira|susan|female|woman|ava|alloy|jenny|aria|natasha|milena|olga|irina/i;

export function LiveQA(){
 const {language,t}=useLanguage();
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState<Message[]>([{id:0,from:'assistant',reply:{text:welcomes[language]}}]);
 const [busy,setBusy]=useState(false);
 const [listening,setListening]=useState(false);
 const [voiceNotice,setVoiceNotice]=useState('');
 const [onlineCount,setOnlineCount]=useState<number|null>(null);
 const list=useRef<HTMLDivElement>(null);
 const inputRef=useRef<HTMLTextAreaElement>(null);
 const recognitionRef=useRef<Recognition|null>(null);
 const nextId=useRef(1);

 useEffect(()=>{if(open){list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'});inputRef.current?.focus();}},[messages,open,busy]);
 useEffect(()=>{if(!open)return;let stopped=false;let sessionId:string;try{sessionId=sessionStorage.getItem('xucuz-presence-session')??crypto.randomUUID();sessionStorage.setItem('xucuz-presence-session',sessionId);}catch{return;}const heartbeat=async()=>{try{const response=await fetch('/api/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sessionId}),cache:'no-store'});const result=await response.json() as {status?:string;onlineCount?:number};if(!stopped&&response.ok&&result.status==='ready'&&typeof result.onlineCount==='number')setOnlineCount(result.onlineCount);else if(!stopped)setOnlineCount(null);}catch{if(!stopped)setOnlineCount(null);}};void heartbeat();const timer=window.setInterval(()=>void heartbeat(),20000);return()=>{stopped=true;window.clearInterval(timer);};},[open]);

 function listen(){
  setVoiceNotice('');
  if(listening){recognitionRef.current?.stop();setListening(false);return;}
  const scope=window as unknown as {SpeechRecognition?:RecognitionCtor;webkitSpeechRecognition?:RecognitionCtor};
  const Constructor=scope.SpeechRecognition??scope.webkitSpeechRecognition;
  if(!Constructor){setVoiceNotice(t('voiceUnsupported'));return;}
  try{
   const recognition=new Constructor();recognition.lang=speechLocale[language];recognition.interimResults=false;
   recognition.onresult=event=>{setInput(event.results[0]?.[0]?.transcript?.slice(0,300)??'');setVoiceNotice('');};
   recognition.onerror=event=>{setListening(false);setVoiceNotice(event.error==='not-allowed'||event.error==='service-not-allowed'?t('micDenied'):event.error==='no-speech'?t('noSpeech'):t('voiceError'));};
   recognition.onend=()=>{setListening(false);recognitionRef.current=null;};recognitionRef.current=recognition;setListening(true);recognition.start();
  }catch{setListening(false);setVoiceNotice(t('voiceError'));}
 }

 function speak(text:string){
  if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){setVoiceNotice(t('voiceOutputUnsupported'));return;}
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang=speechLocale[language];utterance.rate=.96;utterance.pitch=1.04;
  const prefix=language==='tr'?'tr':language==='ru'?'ru':'en';
  const voices=window.speechSynthesis.getVoices().filter(voice=>voice.lang.toLowerCase().startsWith(prefix));
  const preferred=voices.find(voice=>femaleVoiceHints.test(voice.name))??voices.find(voice=>voice.default)??voices[0];
  if(preferred)utterance.voice=preferred;
  utterance.onerror=()=>setVoiceNotice(t('voiceOutputUnsupported'));
  setVoiceNotice(voices.length?t('voiceBestAvailable'):t('voiceDeviceDefault'));
  window.speechSynthesis.speak(utterance);
 }

 async function send(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const question=input.trim().slice(0,300);if(!question||busy)return;
  setVoiceNotice('');setMessages(current=>[...current,{id:nextId.current++,from:'visitor',reply:{text:question}}]);setInput('');setBusy(true);
  let reply:QaReply;
  try{
   const response=await fetch('/api/qa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,language}),signal:AbortSignal.timeout(15000)});
   const body=await response.json() as QaReply|{error:string};
   reply=response.ok&&'text'in body?body:{text:'Şu an yanıt veremedim. Biraz sonra yeniden deneyebilir ya da İletişim sayfasına yazabilirsin.',href:'/iletisim',label:'İletişim sayfası'};
  }catch{reply={text:'Bağlantı kurulamadı veya yanıt zaman aşımına uğradı. Biraz sonra yeniden deneyebilirsin.',href:'/iletisim',label:'İletişim sayfası'};}
  setMessages(current=>[...current,{id:nextId.current++,from:'assistant',reply}]);setBusy(false);
 }

 return <div className="live-qa-root">
  {open&&<section id="live-qa-panel" className="live-qa-panel" role="dialog" aria-modal="false" aria-label="Xucina">
   <header className="live-qa-head"><div className="xucina-avatar" aria-hidden="true"><Image src="/xucina-icon-192.png" alt="" fill sizes="40px"/></div><div><strong id="live-qa-title">Xucina</strong><span className="live-qa-online-line"><span className="live-qa-online-label">Çevrimiçi</span><span className="live-qa-online-count">{onlineCount===null?'—':onlineCount.toLocaleString('tr-TR')}</span></span></div><button type="button" className="live-qa-close" onClick={()=>{setOnlineCount(null);setOpen(false);}} aria-label="Sohbeti kapat"><X size={20}/></button></header>
   <div className="live-qa-messages" ref={list} aria-live="polite" aria-relevant="additions text">
    {messages.map(message=><div className={`live-qa-message ${message.from}`} key={message.id}><p>{message.id===0?welcomes[language]:message.reply.text}</p>{message.from==='assistant'&&<button className="xucina-speak" type="button" onClick={()=>speak(message.reply.text)} aria-label={t('speak')}><Volume2 size={14}/>{t('speak')}</button>}{message.reply.href&&message.reply.label&&<Link href={message.reply.href} onClick={()=>setOpen(false)}>{message.reply.label} →</Link>}</div>)}
    {busy&&<div className="live-qa-message assistant" role="status"><p className="live-qa-typing">•••</p></div>}
   </div>
   <div className="live-qa-prompts"><button type="button" onClick={()=>setInput(t('perUnitPrompt'))}>{t('perUnit')}</button><button type="button" onClick={()=>setInput(t('totalCostPrompt'))}>{t('totalCost')}</button></div>
   <form className="live-qa-form" onSubmit={send}><label className="sr-only" htmlFor="live-qa-input">{t('ask')}</label><textarea ref={inputRef} id="live-qa-input" value={input} onChange={event=>setInput(event.target.value.slice(0,300))} placeholder={t('ask')} rows={1} maxLength={300} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}}/><button type="button" onClick={listen} aria-label={listening?t('stopListening'):t('listen')} aria-pressed={listening} title={t('listen')}><Mic size={17}/></button><button type="submit" aria-label={t('sendQuestion')} disabled={!input.trim()||busy}><Send size={18}/></button></form>
   <p className="live-qa-note">{t('xucinaIntro')} {listening?t('listening'):''}{voiceNotice&&<span className="live-qa-voice-notice" role="status">{voiceNotice}</span>}</p>
  </section>}
  <button type="button" className={`live-qa-launcher ${open?'is-open':''}`} onClick={()=>{setOnlineCount(null);setOpen(value=>!value);}} aria-label={open?'Xucina penceresini kapat':t('xucina')} aria-expanded={open} aria-controls="live-qa-panel"><Sparkles size={21}/><span>{open?'Kapat':t('xucina')}</span></button>
 </div>;
}

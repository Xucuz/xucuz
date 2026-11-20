'use client';

import {FormEvent, KeyboardEvent, useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Plus,Send,ShieldCheck,Sparkles} from 'lucide-react';
import {useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';
import type {Offer} from '@/lib/types';
import {normalize} from '@/lib/categories';
import {money,total} from '@/lib/pricing';

type Message={role:'user'|'assistant';text:string;offers?:Offer[]};
const productTerms:[string,string[]][]=[['beyaz-esya',['buzdolabi','no frost','camasir makinesi','bulasik makinesi','derin dondurucu','firin']],['elektronik',['telefon','iphone','samsung','laptop','bilgisayar','televizyon','kulaklik','tablet']],['market',['sut','kahve','zeytinyagi','pirinc','deterjan','market']],['cicek',['cicek','gul','buket']]];
function productCategory(query:string){const normalized=normalize(query);return productTerms.find(([,terms])=>terms.some(term=>normalized.includes(normalize(term))))?.[0];}
type Status={assistantReady:boolean;priceDatabaseConfigured:boolean};

export function XucuzAiChat(){
 const {language}=useLanguage();const t=(key:Parameters<typeof worldText>[1])=>worldText(language,key);
 const [status,setStatus]=useState<Status>({assistantReady:false,priceDatabaseConfigured:false});
 const [messages,setMessages]=useState<Message[]>([]);const [question,setQuestion]=useState('');const [sending,setSending]=useState(false);const [error,setError]=useState('');const logRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{let live=true;fetch('/api/xucuz-ai',{cache:'no-store'}).then(r=>r.json()).then(data=>{if(live)setStatus({assistantReady:Boolean(data.assistantReady),priceDatabaseConfigured:Boolean(data.priceDatabaseConfigured)});}).catch(()=>{});return()=>{live=false;};},[]);
 useEffect(()=>{logRef.current?.scrollTo({top:logRef.current.scrollHeight,behavior:'smooth'});},[messages,sending]);
 async function submit(event?:FormEvent<HTMLFormElement>,preset?:string){event?.preventDefault();const prompt=(preset??question).trim();if(!prompt||sending)return;setQuestion('');setError('');const next:Message[]=[...messages,{role:'user' as const,text:prompt}].slice(-10);const searchContext=[...messages.filter(message=>message.role==='user').map(message=>message.text),prompt].slice(-3).join(' ');const category=productCategory(searchContext);setMessages(next);setSending(true);
  try{
   const response=await fetch('/api/xucuz-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,messages:next.map(message=>({role:message.role,content:message.text}))})});
   const type=response.headers.get('content-type')??'';let answer='';
   if(type.includes('application/json')){const body=await response.json();answer=String(body.text??body.error??t('apiError'));if(!response.ok)setError(String(body.code??''));}
   else{answer=await response.text();if(!response.ok)answer=answer||t('apiError');}
   let offers:Offer[]=[];if(category){try{const params=new URLSearchParams({category,q:searchContext,sort:'price-asc',page:'1'});const result=await fetch(`/api/search?${params.toString()}`,{cache:'no-store'});if(result.ok){const data=await result.json();offers=(Array.isArray(data.offers)?data.offers:[]).filter((offer:Offer)=>!offer.demo&&offer.available&&Boolean(offer.url));}}catch{}}
   if(offers.length){answer=language==='en'?'I found these current offers in connected sources. Results are ordered by total price; verify stock and delivery on the seller site.':language==='ru'?'Нашёл текущие предложения в подключённых источниках. Они отсортированы по итоговой цене; проверьте наличие и доставку на сайте продавца.':'Bağlı kaynaklarda bu teklifleri buldum. Toplam fiyata göre sıraladım; stok ve teslimat koşullarını satıcı sayfasında doğrula.';}
   setMessages([...next,{role:'assistant' as const,text:answer,...(offers.length?{offers}:{})}].slice(-12));
  }catch{setMessages([...next,{role:'assistant' as const,text:t('apiError')}].slice(-12));}
  finally{setSending(false);}
 }
 function onComposerKeyDown(event:KeyboardEvent<HTMLTextAreaElement>){if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void submit();}}
 function newChat(){if(sending)return;setMessages([]);setQuestion('');setError('');}
 const suggestions=[t('promptPrice'),t('promptGuide'),t('promptTravel')];
 return <main className="xucin-chat-page">
  <header className="xucin-chat-topbar"><Link href="/" className="xucin-chat-back"><ArrowLeft size={17}/><span>{t('backHome')}</span></Link><div className="xucin-chat-brand"><Sparkles size={18}/><strong>Xucin</strong><span>Xucuz AI</span></div><button className="xucin-new-chat" type="button" onClick={newChat} disabled={sending}><Plus size={16}/><span>Yeni sohbet</span></button></header>
  <div className={`xucin-chat-column ${messages.length?'has-messages':''}`}>
   {messages.length===0?<section className="xucin-welcome"><Image src="/xucuz-world-genie.webp" alt={t('genieAlt')} width={88} height={88} priority/><h1>Bugün ne arıyorsun?</h1><p>Ürün, alışveriş veya gezi hakkında Xucin’e sor.</p><span className="xucin-source-note"><ShieldCheck size={14}/>{t('priceScope')}</span></section>:<div className="xucin-conversation" ref={logRef} aria-live="polite">
    {messages.map((message,index)=><article className={`xucin-message ${message.role}`} key={`${index}-${message.role}`}><div className="xucin-message-avatar">{message.role==='assistant'?<Image src="/xucuz-world-genie.webp" alt="" width={30} height={30}/>:<span>Sen</span>}</div><div className="xucin-message-content"><strong>{message.role==='assistant'?'Xucin':'Sen'}</strong><p>{message.text}</p>{message.offers&&<div className="world-chat-offers" aria-label={language==='en'?'Verified store results':language==='ru'?'Проверенные предложения магазинов':'Doğrulanmış mağaza sonuçları'}>{message.offers.map(offer=><article className="world-chat-offer" key={offer.id}><div className="world-chat-offer-meta"><strong>{offer.provider}</strong><time dateTime={offer.updatedAt}>{new Intl.DateTimeFormat(language==='en'?'en-US':language==='ru'?'ru-RU':'tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(offer.updatedAt))}</time></div><a href={offer.url??undefined} target="_blank" rel="noopener noreferrer" className="world-chat-offer-title">{offer.title}<ArrowUpRight size={13}/></a><strong className="world-chat-offer-price">{money(total(offer),offer.currency)}</strong><small>{offer.source}</small></article>)}</div>}{message.role==='assistant'&&<Link href="/fiyatlar" className="xucin-verified-link">{t('verified')}<ArrowUpRight size={13}/></Link>}</div></article>)}
    {sending&&<div className="xucin-thinking"><span className="xucin-thinking-dot"/><span>{t('thinking')}</span></div>}
   </div>}
   {messages.length===0&&<div className="xucin-suggestions">{suggestions.map((prompt,index)=><button type="button" key={`${index}-${prompt}`} onClick={()=>void submit(undefined,prompt)} disabled={sending}>{prompt}</button>)}</div>}
   <div className="xucin-composer-wrap"><form className="xucin-composer" onSubmit={submit}><label className="sr-only" htmlFor="xucin-question">{t('chatPlaceholder')}</label><textarea id="xucin-question" value={question} onChange={event=>setQuestion(event.target.value)} onKeyDown={onComposerKeyDown} placeholder={t('chatPlaceholder')} maxLength={1200} rows={1} disabled={sending}/><button type="submit" aria-label={t('send')} disabled={sending||question.trim().length===0}><Send size={18}/></button></form><div className="xucin-disclaimer">{error||t('aiPrivacy')}</div></div>
  </div>
  <footer className="xucin-chat-footer"><span className={status.assistantReady?'ready':''}/>{status.assistantReady?t('aiReady'):t('aiUnavailable')} · {status.priceDatabaseConfigured?t('aiPriceReady'):t('priceScope')}</footer>
 </main>;
}

'use client';
import {FormEvent,useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Send,ShieldCheck,Sparkles} from 'lucide-react';
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
 return <div className="world-ai-page">
  <div className="world-ai-heading"><Link href="/" className="world-back-link"><ArrowLeft size={15}/>{t('backHome')}</Link><p className="world-eyebrow"><span/>{t('aiEyebrow')}</p><h1>{t('aiPageTitle')}</h1><p>{t('aiLead')}</p></div>
  <div className="world-ai-layout">
   <aside className="world-ai-side">
    <div className="world-ai-mascot-card"><span className="world-ai-halo"/><Image className="world-ai-mascot-image" src="/xucuz-world-genie.webp" alt={t('genieAlt')} width={630} height={630} priority sizes="(max-width:640px) 90vw, 35vw"/><span className="world-ai-spark"><Sparkles size={17}/></span></div>
    <div className={`world-ai-status ${status.assistantReady?'is-ready':'is-offline'}`}><span className="world-ai-status-dot"/><div><strong>{status.assistantReady?t('aiReady'):t('aiUnavailable')}</strong><small>{status.priceDatabaseConfigured?t('aiPriceReady'):t('priceScope')}</small></div></div>
    <div className="world-ai-privacy"><ShieldCheck size={17}/><p>{t('aiPrivacy')}</p></div>
   </aside>
   <section className="world-chat-card" aria-label={t('ai')}>
   <div className="world-chat-header"><span className="world-chat-mark"><Sparkles size={17}/></span><div><strong>Xucin</strong><small>{status.assistantReady?t('aiReady'):t('aiUnavailable')}</small></div><span className="world-chat-preview">PREVIEW</span></div>
    <div className="world-chat-messages" ref={logRef} aria-live="polite">
     {messages.length===0&&<div className="world-chat-welcome"><p>{t('aiLead')}</p><span className="world-chat-scope"><ShieldCheck size={14}/>{t('priceScope')}</span></div>}
     {messages.map((message,index)=><div className={`world-chat-message ${message.role}`} key={`${index}-${message.role}`}><span>{message.role==='assistant'?'🧞‍♂️':'YOU'}</span><p>{message.text}</p>{message.offers&&<div className="world-chat-offers" aria-label={language==='en'?'Verified store results':language==='ru'?'Проверенные предложения магазинов':'Doğrulanmış mağaza sonuçları'}>{message.offers.map(offer=><article className="world-chat-offer" key={offer.id}><div className="world-chat-offer-meta"><strong>{offer.provider}</strong><time dateTime={offer.updatedAt}>{new Intl.DateTimeFormat(language==='en'?'en-US':language==='ru'?'ru-RU':'tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(offer.updatedAt))}</time></div><a href={offer.url??undefined} target="_blank" rel="noopener noreferrer" className="world-chat-offer-title">{offer.title}<ArrowUpRight size={13}/></a><strong className="world-chat-offer-price">{money(total(offer),offer.currency)}</strong><small>{offer.source}</small></article>)}</div>}{message.role==='assistant'&&<Link href="/fiyatlar">{t('verified')}<ArrowUpRight size={12}/></Link>}</div>)}
     {sending&&<div className="world-chat-message assistant"><span>🧞‍♂️</span><p className="world-chat-pending"><i/>{t('thinking')}</p></div>}
    </div>
    <div className="world-chat-prompts">{(['promptPrice','promptGuide','promptTravel'] as const).map(key=><button type="button" key={key} disabled={sending} onClick={()=>void submit(undefined,t(key))}>{t(key)}</button>)}</div>
    <form className="world-chat-composer" onSubmit={submit}><label className="sr-only" htmlFor="xucuz-ai-question">{t('chatPlaceholder')}</label><textarea id="xucuz-ai-question" value={question} onChange={event=>setQuestion(event.target.value)} placeholder={t('chatPlaceholder')} maxLength={1200} rows={2} disabled={sending}/><button type="submit" aria-label={t('send')} disabled={sending||question.trim().length===0}><Send size={17}/></button></form>
    <div className="world-chat-foot"><span>{status.priceDatabaseConfigured?'DB · VERIFIED RECORDS':'DB · NOT CONFIGURED'}</span><span>{error||'MESSAGES NOT SAVED'}</span></div>
   </section>
  </div>
 </div>;
}

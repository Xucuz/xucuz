'use client';
import {FormEvent,useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Send,ShieldCheck,Sparkles} from 'lucide-react';
import {useLanguage} from './language-provider';
import {worldText} from '@/lib/xucuz-world-copy';

type Message={role:'user'|'assistant';text:string};
type Status={assistantReady:boolean;priceDatabaseConfigured:boolean};

export function XucuzAiChat(){
 const {language}=useLanguage();const t=(key:Parameters<typeof worldText>[1])=>worldText(language,key);
 const [status,setStatus]=useState<Status>({assistantReady:false,priceDatabaseConfigured:false});
 const [messages,setMessages]=useState<Message[]>([]);const [question,setQuestion]=useState('');const [sending,setSending]=useState(false);const [error,setError]=useState('');const logRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{let live=true;fetch('/api/xucuz-ai',{cache:'no-store'}).then(r=>r.json()).then(data=>{if(live)setStatus({assistantReady:Boolean(data.assistantReady),priceDatabaseConfigured:Boolean(data.priceDatabaseConfigured)});}).catch(()=>{});return()=>{live=false;};},[]);
 useEffect(()=>{logRef.current?.scrollTo({top:logRef.current.scrollHeight,behavior:'smooth'});},[messages,sending]);
 async function submit(event?:FormEvent<HTMLFormElement>,preset?:string){event?.preventDefault();const prompt=(preset??question).trim();if(!prompt||sending)return;setQuestion('');setError('');const next:Message[]=[...messages,{role:'user' as const,text:prompt}].slice(-10);setMessages(next);setSending(true);
  try{
   const response=await fetch('/api/xucuz-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,messages:next.map(message=>({role:message.role,content:message.text}))})});
   const type=response.headers.get('content-type')??'';let answer='';
   if(type.includes('application/json')){const body=await response.json();answer=String(body.text??body.error??t('apiError'));if(!response.ok)setError(String(body.code??''));}
   else{answer=await response.text();if(!response.ok)answer=answer||t('apiError');}
   setMessages([...next,{role:'assistant' as const,text:answer}].slice(-12));
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
    <div className="world-chat-header"><span className="world-chat-mark"><Sparkles size={17}/></span><div><strong>Xucuz AI</strong><small>{status.assistantReady?t('aiReady'):t('aiUnavailable')}</small></div><span className="world-chat-preview">PREVIEW</span></div>
    <div className="world-chat-messages" ref={logRef} aria-live="polite">
     {messages.length===0&&<div className="world-chat-welcome"><p>{t('aiLead')}</p><span className="world-chat-scope"><ShieldCheck size={14}/>{t('priceScope')}</span></div>}
     {messages.map((message,index)=><div className={`world-chat-message ${message.role}`} key={`${index}-${message.role}`}><span>{message.role==='assistant'?'🧞‍♂️':'YOU'}</span><p>{message.text}</p>{message.role==='assistant'&&<Link href="/fiyatlar">{t('verified')}<ArrowUpRight size={12}/></Link>}</div>)}
     {sending&&<div className="world-chat-message assistant"><span>🧞‍♂️</span><p className="world-chat-pending"><i/>{t('thinking')}</p></div>}
    </div>
    <div className="world-chat-prompts">{(['promptPrice','promptGuide','promptTravel'] as const).map(key=><button type="button" key={key} disabled={sending} onClick={()=>void submit(undefined,t(key))}>{t(key)}</button>)}</div>
    <form className="world-chat-composer" onSubmit={submit}><label className="sr-only" htmlFor="xucuz-ai-question">{t('chatPlaceholder')}</label><textarea id="xucuz-ai-question" value={question} onChange={event=>setQuestion(event.target.value)} placeholder={t('chatPlaceholder')} maxLength={1200} rows={2} disabled={sending}/><button type="submit" aria-label={t('send')} disabled={sending||question.trim().length===0}><Send size={17}/></button></form>
    <div className="world-chat-foot"><span>{status.priceDatabaseConfigured?'DB · VERIFIED RECORDS':'DB · NOT CONFIGURED'}</span><span>{error||'MESSAGES NOT SAVED'}</span></div>
   </section>
  </div>
 </div>;
}

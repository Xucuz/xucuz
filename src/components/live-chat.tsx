'use client';

import {FormEvent,useCallback,useEffect,useRef,useState} from 'react';
import {LogOut,MessageCircle,Send,X} from 'lucide-react';

type Member={id:string;nickname:string};
type ChatMessage={id:string;nickname:string;body:string;createdAt:string};

export function LiveChat(){
 const [open,setOpen]=useState(false);
 const [member,setMember]=useState<Member|null>(null);
 const [mode,setMode]=useState<'login'|'register'>('register');
 const [nickname,setNickname]=useState('');
 const [password,setPassword]=useState('');
 const [message,setMessage]=useState('');
 const [messages,setMessages]=useState<ChatMessage[]>([]);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const list=useRef<HTMLDivElement>(null);
 const lastId=useRef('0');

 const getMember=useCallback(async()=>{
  setLoading(true);setError('');
  try{const response=await fetch('/api/live-chat/auth',{cache:'no-store'});const body=await response.json() as {member:Member|null;error?:string};if(response.ok){setMember(body.member);if(body.member)setMode('login');}else setError(body.error??'Sohbete bağlanılamadı.');}
  catch{setError('Bağlantı kurulamadı. Biraz sonra yeniden dene.');}
  finally{setLoading(false);}
 },[]);

 useEffect(()=>{if(!open||!member)return;let stopped=false;let running=false;const poll=async()=>{if(running)return;running=true;try{const response=await fetch(`/api/live-chat/messages?after=${lastId.current}`,{cache:'no-store'});const body=await response.json() as {messages?:ChatMessage[];error?:string};if(response.status===401){setMember(null);setError('Oturumun sona erdi. Yeniden giriş yap.');}else if(!response.ok){if(!stopped)setError(body.error??'Mesajlar yüklenemedi.');}else if(!stopped){setMessages(current=>{const known=new Set(current.map(item=>item.id));const fresh=(body.messages??[]).filter(item=>!known.has(item.id));if(fresh.length)lastId.current=fresh[fresh.length-1]!.id;return [...current,...fresh].slice(-100);});}}
   catch{if(!stopped)setError('Sohbet bağlantısı kesildi; yeniden bağlanılıyor.');}
   finally{running=false;}
  };void poll();const timer=window.setInterval(()=>void poll(),3500);return()=>{stopped=true;window.clearInterval(timer);};},[open,member]);
 useEffect(()=>{list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'});},[messages]);

 async function authenticate(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const response=await fetch('/api/live-chat/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:mode,nickname,password})});const body=await response.json() as {member?:Member;error?:string};if(!response.ok||!body.member){setError(body.error??'Giriş yapılamadı.');return;}setMember(body.member);setPassword('');setMessages([]);lastId.current='0';}
  catch{setError('Bağlantı kurulamadı.');}
  finally{setBusy(false);}
 }
 async function sendMessage(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const text=message.trim();if(!text||busy)return;setBusy(true);setError('');
  try{const response=await fetch('/api/live-chat/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});const body=await response.json() as {message?:ChatMessage;error?:string};if(response.status===403&&body.error?.includes('engellendi')){setMember(null);setPassword('');setError(body.error);return;}if(!response.ok||!body.message){setError(body.error??'Mesaj gönderilemedi.');return;}setMessage('');setMessages(current=>[...current,body.message!].slice(-100));lastId.current=body.message.id;}
  catch{setError('Mesaj gönderilemedi; bağlantıyı kontrol et.');}
  finally{setBusy(false);}
 }
 async function logout(){setBusy(true);try{await fetch('/api/live-chat/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});}finally{setBusy(false);setMember(null);setMessages([]);lastId.current='0';setError('');}}

 return <div className="member-chat-root">
  {open&&<section id="member-chat-panel" className="member-chat-panel" role="dialog" aria-modal="false" aria-labelledby="member-chat-title">
   <header className="member-chat-head"><span className="member-chat-icon"><MessageCircle size={19}/></span><div><strong id="member-chat-title">Canlı Sohbet</strong><span>Toplulukla gerçek zamanlı konuş</span></div><button type="button" className="member-chat-close" onClick={()=>setOpen(false)} aria-label="Sohbeti kapat"><X size={19}/></button></header>
   {loading?<div className="member-chat-state" role="status">Sohbete bağlanılıyor…</div>:member?<>
    <div className="member-chat-rules">Rumuzun: <strong>{member.nickname}</strong> · Saygılı ol; küfür ve hakaret hesap engeline neden olur.</div>
    <div className="member-chat-messages" ref={list} aria-live="polite">{messages.length?messages.map(item=><article className={`member-chat-message${item.nickname===member.nickname?' is-mine':''}`} key={item.id}><strong>{item.nickname}</strong><p>{item.body}</p><time dateTime={item.createdAt}>{new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(new Date(item.createdAt))}</time></article>):<p className="member-chat-empty">Henüz mesaj yok. Sohbeti başlatan sen ol.</p>}</div>
    {error&&<p className="member-chat-error" role="alert">{error}</p>}
    <form className="member-chat-compose" onSubmit={sendMessage}><label className="sr-only" htmlFor="member-chat-message">Mesajın</label><textarea id="member-chat-message" value={message} onChange={event=>setMessage(event.target.value.slice(0,500))} maxLength={500} rows={2} placeholder="Mesajını yaz…" onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}}/><button type="submit" aria-label="Mesajı gönder" disabled={!message.trim()||busy}><Send size={18}/></button></form>
    <button type="button" className="member-chat-logout" onClick={()=>void logout()} disabled={busy}><LogOut size={14}/> Çıkış yap</button>
   </>:<div className="member-chat-auth-wrap">
    <div className="member-chat-tabs"><button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('');}}>Üye ol</button><button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');}}>Giriş yap</button></div>
    <p className="member-chat-auth-note">Canlı sohbete katılmak için rumuzlu üye hesabı gerekir. E-posta veya telefon istemiyoruz.</p>
    <form className="member-chat-auth" onSubmit={authenticate}><label>Rumuz<input value={nickname} onChange={event=>setNickname(event.target.value.slice(0,40))} autoComplete="username" minLength={3} maxLength={20} required placeholder="Örn. AlisverisMeraklisi"/></label><label>Parola<input type="password" value={password} onChange={event=>setPassword(event.target.value.slice(0,128))} autoComplete={mode==='register'?'new-password':'current-password'} minLength={10} maxLength={128} required placeholder="En az 10 karakter"/></label><button type="submit" disabled={busy}>{busy?'Bekle…':mode==='register'?'Üyeliği oluştur ve katıl':'Giriş yap'}</button></form>
    {error&&<p className="member-chat-error" role="alert">{error}</p>}
    <p className="member-chat-rules-note">Küfür, hakaret ve taciz yasaktır. Bu davranışlar hesabın kalıcı olarak engellenmesine yol açar.</p>
   </div>}
  </section>}
  <button className={`member-chat-launcher${open?' is-open':''}`} type="button" onClick={()=>{if(!open)void getMember();setOpen(value=>!value);}} aria-expanded={open} aria-controls="member-chat-panel"><span className="member-chat-live-dot"/><MessageCircle size={18}/><span>Canlı Sohbet</span></button>
 </div>;
}

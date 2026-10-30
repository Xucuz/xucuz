'use client';
import {useCallback,useEffect,useState} from 'react';
type Message={id:string;display_name:string;body:string;created_at:string};
export default function ChatRoom(){
 const [messages,setMessages]=useState<Message[]>([]);
 const [body,setBody]=useState('');
 const [error,setError]=useState('');
 const [sending,setSending]=useState(false);
 const [nickname,setNickname]=useState('');
 const [profileName,setProfileName]=useState('');
 const [profileMessage,setProfileMessage]=useState('');
 const refresh=useCallback(async()=>{
  try{const response=await fetch('/api/chat/messages',{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();setMessages(data.messages);setError('');}
  catch{setError('Mesajlar şu anda yüklenemiyor.');}
 },[]);
 useEffect(()=>{void fetch('/api/chat/profile').then(r=>r.json()).then(p=>{setNickname(p.nickname??'');setProfileName(p.name??'');}).catch(()=>{});},[]);
 useEffect(()=>{void refresh();const timer=setInterval(()=>void refresh(),5000);return()=>clearInterval(timer);},[refresh]);
 async function send(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!body.trim()||sending)return;setSending(true);
  try{const response=await fetch('/api/chat/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body})});if(!response.ok)throw Error();setBody('');await refresh();}
  catch{setError('Mesaj gönderilemedi. Biraz sonra tekrar dene.');}
  finally{setSending(false);}
 }
 async function saveNickname(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setProfileMessage('');
  try{const response=await fetch('/api/chat/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname})});if(!response.ok){setProfileMessage(response.status===409?'Bu rumuz kullanılıyor.':'Rumuz kaydedilemedi.');return;}setProfileMessage('Tercihin kaydedildi.');}
  catch{setProfileMessage('Rumuz kaydedilemedi.');}
 }
 return <section style={{marginTop:24,border:'1px solid #cbd5e1',borderRadius:12,padding:16}}>
 <h2>Topluluk Sohbeti</h2>
 <form onSubmit={saveNickname} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}><label style={{width:'100%'}}>Sohbette görünen adın (isteğe bağlı rumuz; boş bırakırsan Google adın: {profileName})</label><input aria-label="Rumuz" value={nickname} maxLength={24} onChange={e=>setNickname(e.target.value)} placeholder="Rumuz (isteğe bağlı)" style={{flex:1,minWidth:180,padding:10,border:'1px solid #94a3b8',borderRadius:8}}/><button type="submit">Kaydet</button>{profileMessage&&<p role="status" style={{width:'100%'}}>{profileMessage}</p>}</form><p style={{fontSize:13,color:'#475569'}}>Mesajlar herkese açıktır. Kişisel bilgi paylaşma; saygılı ol.</p>
 <div aria-live="polite" style={{height:320,overflowY:'auto',background:'#f8fafc',borderRadius:8,padding:12}}>
 {messages.length===0?<p>Henüz mesaj yok. İlk mesajı sen yaz!</p>:messages.map(message=><div key={message.id} style={{marginBottom:12,overflowWrap:'anywhere'}}><strong>{message.display_name}</strong> <small>{new Date(message.created_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</small><div>{message.body}</div></div>)}
 </div>
 {error&&<p role="alert" style={{color:'#b91c1c'}}>{error}</p>}
 <form onSubmit={send} style={{display:'flex',gap:8,marginTop:12}}>
 <input aria-label="Mesajın" value={body} onChange={e=>setBody(e.target.value)} maxLength={1000} placeholder="Mesajını yaz..." style={{flex:1,minWidth:0,padding:10,border:'1px solid #94a3b8',borderRadius:8}}/>
 <button type="submit" disabled={sending||!body.trim()} style={{padding:'10px 18px',borderRadius:8,background:'#166534',color:'white'}}>{sending?'Gönderiliyor':'Gönder'}</button>
 </form></section>;
}

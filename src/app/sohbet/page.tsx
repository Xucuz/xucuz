import type {Metadata} from 'next';
import Link from 'next/link';
import ChatRoom from './chat-room';
import {facebookConfigured,member,socialConfigured} from '@/lib/social-auth';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Xucuz Canlı Sohbet — Sosyal Giriş',description:'Google hesabınla güvenle giriş yap; telefon numarası gerekmez.'};
export default async function SohbetPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const [user,params]=await Promise.all([member(),searchParams]);
 return <section className="wrap" style={{maxWidth:780,margin:'3rem auto 5rem',padding:'0 1rem'}}>
 <h1>Xucuz Canlı Sohbet</h1><p>Google hesabınla giriş yap; istersen sohbette kendine özel bir rumuz kullan.</p>
 {params.error&&<p role="alert" style={{color:'#b91c1c'}}>Giriş tamamlanamadı. Hata aşaması: {params.error}. Lütfen bu kodu bildir.</p>}
 {user?<div style={{padding:20,border:'1px solid #cbd5e1',borderRadius:12}}><p>Hoş geldin, <strong>{user.name}</strong>! Google hesabınla güvenli giriş yaptın.</p><form action="/api/auth/logout" method="post"><button type="submit">Çıkış yap</button></form></div>:
 <div style={{display:'grid',gap:12,maxWidth:360}}>
 {socialConfigured()?<Link href="/api/auth/google" style={{display:'block',padding:14,border:'1px solid #94a3b8',borderRadius:10,textAlign:'center',fontWeight:700}}>Google ile giriş yap</Link>:<p>Google girişi henüz yapılandırılmadı.</p>}
 <p style={{color:'#64748b'}}>Facebook ile giriş {facebookConfigured()?'yakında etkinleştirilecek':'uygulama ayarları tamamlanınca açılacak'}.</p>
 </div>}
 {user?<ChatRoom/>:<p>Mesajları görmek ve yazmak için Google hesabınla giriş yap.</p>}</section>;
}

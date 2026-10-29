import type {Metadata} from 'next';
import Link from 'next/link';
import {facebookConfigured,member,socialConfigured} from '@/lib/social-auth';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Xucuz Canlı Sohbet — Sosyal Giriş',description:'Google hesabınla güvenle giriş yap; telefon numarası gerekmez.'};
export default async function SohbetPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const [user,params]=await Promise.all([member(),searchParams]);
 return <section className="wrap" style={{maxWidth:780,margin:'3rem auto 5rem',padding:'0 1rem'}}>
 <h1>Xucuz Canlı Sohbet</h1><p>Sohbet üyeliği için telefon numarası veya SMS gerekmez.</p>
 {params.error&&<p role="alert" style={{color:'#b91c1c'}}>Giriş tamamlanamadı. Lütfen tekrar dene veya site yöneticisine bildir.</p>}
 {user?<div style={{padding:20,border:'1px solid #cbd5e1',borderRadius:12}}><p>Hoş geldin, <strong>{user.name}</strong>! Google hesabınla güvenli giriş yaptın.</p><form action="/api/auth/logout" method="post"><button type="submit">Çıkış yap</button></form></div>:
 <div style={{display:'grid',gap:12,maxWidth:360}}>
 {socialConfigured()?<Link href="/api/auth/google" style={{display:'block',padding:14,border:'1px solid #94a3b8',borderRadius:10,textAlign:'center',fontWeight:700}}>Google ile giriş yap</Link>:<p>Google girişi henüz yapılandırılmadı.</p>}
 <p style={{color:'#64748b'}}>Facebook ile giriş {facebookConfigured()?'yakında etkinleştirilecek':'uygulama ayarları tamamlanınca açılacak'}.</p>
 </div>}
 <div role="status" style={{marginTop:24,padding:'1.25rem',border:'1px solid #cbd5e1',borderRadius:12,background:'#f8fafc',color:'#0f172a'}}>
 <strong>Sohbet mesajlaşması henüz açılmadı.</strong><p style={{marginBottom:0}}>Sosyal hesapla giriş üyeliğin ilk adımıdır. Mesajlaşma altyapısı ve moderasyon tamamlanana kadar mesaj gönderimi kapalıdır.</p>
 </div></section>;
}

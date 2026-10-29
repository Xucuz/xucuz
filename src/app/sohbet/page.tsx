import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canlı Sohbet — Sosyal Hesapla Giriş',
  description: 'Xucuz canlı sohbetine sosyal hesabınla giriş yaparak katıl.',
};

const providers = [
  { name: 'Google', detail: 'Google hesabı ile giriş için OAuth uygulaması yapılandırılacak.' },
  { name: 'Facebook', detail: 'Facebook Login uygulaması ve gerekli izinler yapılandırılacak.' },
];

export default function SohbetPage() {
  return (
    <section className="wrap" style={{maxWidth:780,margin:'3rem auto 5rem',padding:'0 1rem'}}>
      <h1>Xucuz Canlı Sohbet</h1>
      <p>Sohbete mesaj yazmak için desteklenen bir sosyal hesapla güvenli giriş yapılması gerekecek. <strong>SMS veya telefon numarası zorunlu değildir.</strong></p>
      <h2>Planlanan giriş seçenekleri</h2>
      <ul style={{display:'grid',gap:12,paddingLeft:22}}>
        {providers.map(provider=><li key={provider.name}><strong>{provider.name}</strong> — {provider.detail}</li>)}
      </ul>
      <div role="status" style={{padding:'1.25rem',border:'1px solid #cbd5e1',borderRadius:12,background:'#f8fafc',color:'#0f172a'}}>
        <strong>Sohbet henüz kullanıma açılmadı.</strong>
        <p style={{marginBottom:0}}>Sosyal giriş uygulama kimlikleri ve sunucu tarafında oturum doğrulaması tamamlanana kadar mesaj gönderilemez. Giriş seçenekleri henüz aktif değildir. Kullanıcıların özel hesap bilgileri diğer üyelere gösterilmeyecektir.</p>
      </div>
    </section>
  );
}

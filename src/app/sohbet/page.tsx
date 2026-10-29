import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canlı Sohbet — Üyelik ve Doğrulama',
  description: 'Xucuz canlı sohbetine katılmak için e-posta ve telefon doğrulaması zorunludur.',
};

export default function SohbetPage() {
  return (
    <section className="wrap" style={{maxWidth:780,margin:'3rem auto 5rem',padding:'0 1rem'}}>
      <h1>Xucuz Canlı Sohbet</h1>
      <p>Topluluk sohbetine katılmak için <strong>hem e-posta adresini hem de telefon numaranı doğrulaman gerekir.</strong></p>
      <p>Google ile giriş yapan üyeler için de telefon doğrulaması zorunludur. Doğrulanmamış hesaplar mesaj gönderemez.</p>
      <div role="status" style={{padding:'1.25rem',border:'1px solid #cbd5e1',borderRadius:12,background:'#f8fafc',color:'#0f172a'}}>
        <strong>Sohbet henüz kullanıma açılmadı.</strong>
        <p style={{marginBottom:0}}>Güvenli e-posta ve SMS doğrulama altyapısı tamamlanana kadar mesajlaşma kapalıdır. Üyelerin e-posta adresleri ve telefon numaraları herkese açık gösterilmeyecektir.</p>
      </div>
    </section>
  );
}

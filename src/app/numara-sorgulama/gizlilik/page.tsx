import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';

export const metadata:Metadata={
  title:'Telefon sorgulama — gizlilik ve haklar (taslak)',
  robots:{index:false,follow:false},
};

export default function Page(){
  if(process.env.PHONE_LOOKUP_DEMO_ENABLED !== 'true') notFound();
  return <article className="wrap content-page" style={{maxWidth:760,paddingTop:48,paddingBottom:72}}>
    <p><Link href="/numara-sorgulama">← Numara sorgulamaya dön</Link></p>
    <h1>Gizlilik ve haklar — geliştirme taslağı</h1>
    <p><strong>Bu sayfa hukuki aydınlatma metni değildir.</strong> Veri sorumlusu, işleme amaçları, hukuki sebepler, saklama süreleri ve başvuru kanalları gerçek hizmetten önce belirlenip hukuk incelemesinden geçmelidir.</p>
    <h2>Şu an hangi veriler işleniyor?</h2>
    <p>Bu demo yalnızca tarayıcı içinde numara biçimi kontrolü yapar. Telefon numaraları uygulama sunucusuna gönderilmez ve veritabanına kaydedilmez. Spam bildirimi yalnızca yerel bir önizlemedir.</p>
    <h2>Gerçek hizmete geçiş koşulları</h2>
    <p>İzinli numara profilleri, veri minimizasyonu, saklama ve silme politikaları, moderasyon, itiraz mekanizması, güvenli kimlik doğrulama ve KVKK başvuru kanalı tamamlanmadan gerçek kayıt toplanmayacaktır.</p>
    <h2>Numaranızın görünmesini istemiyorsanız</h2>
    <p>Bu demoda kamuya açık telefon profili bulunmaz. İleride açılabilecek gerçek hizmette erişim, düzeltme, silme ve itiraz talepleri için doğrulanmış bir başvuru süreci sağlanacaktır. Şu anda bu sayfa üzerinden kişisel veri veya telefon numarası göndermeyin.</p>
  </article>;
}

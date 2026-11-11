import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Türkiye Nöbetçi Eczane Sorgulama | Xucuz',
  description: '81 il için nöbetçi eczane sorgulama hizmetine güvenli erişim. Güncel sonuçlar için resmî kaynağı kontrol edin.',
};

const provinces = ['Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkâri','Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'];

export default function PharmacyDutyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <a href="/" className="text-sm underline">← Xucuz ana sayfa</a>
      <h1 className="mt-6 text-3xl font-bold">Türkiye Geneli Nöbetçi Eczane</h1>
      <p className="mt-3 text-base">81 il için nöbetçi eczane bilgilerine resmî sorgulama hizmetinden ulaşın.</p>
      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">İl seçimi</h2>
        <p className="mt-2 text-sm">Aşağıdaki il listesi kapsamı gösterir. Bu ön sürümde ilçe bazlı canlı sonuç sunulmaz; resmî sorgulama ekranında il ve ilçenizi seçin.</p>
        <label htmlFor="province" className="mt-5 block text-sm font-medium">İl</label>
        <select id="province" defaultValue="" className="mt-2 w-full rounded-lg border bg-transparent p-3">
          <option value="" disabled>İl seçiniz</option>
          {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
        </select>
        <a href="https://www.turkiye.gov.tr/saglik-titck-nobetci-eczane-sorgulama" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white">
          Resmî nöbetçi eczane sorgulamasını aç ↗
        </a>
      </section>
      <p className="mt-6 text-sm">Önemli: Xucuz şu anda canlı nöbetçi eczane verisi yayınlamaz. Nöbet listeleri değişebilir; yola çıkmadan önce resmî kaynaktaki güncel adres ve telefonu kontrol edin. Acil sağlık durumlarında 112’yi arayın.</p>
    </main>
  );
}

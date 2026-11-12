'use client';

import {useState} from 'react';
import {ArrowUpRight,MapPin,Pill} from 'lucide-react';
import {turkiyeCities} from '@/lib/turkiye-cities';

type Pharmacy = {id: string; name: string; district?: string; address?: string; onCall: boolean; detailUrl: string};
type Result = {date: string; validityStart: string; validityEnd: string; total: number; returned: number; notice?: string; sourceUrl: string; attribution: string; attributionUrl: string; pharmacies: Pharmacy[]};

export function OnDutyPharmacies() {
  const [city, setCity] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(selectedCity: string) {
    setCity(selectedCity);
    setResult(null);
    setError('');
    if (!selectedCity) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/pharmacies?city=${encodeURIComponent(selectedCity)}`, {cache: 'no-store'});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Liste yüklenemedi.');
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Liste yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  return <section className="duty-pharmacies" aria-labelledby="duty-pharmacies-title">
    <div className="duty-pharmacies-heading">
      <div className="duty-pharmacies-icon"><Pill size={21}/></div>
      <div><p className="community-kicker">GÜNCEL BÖLGE BİLGİSİ</p><h2 id="duty-pharmacies-title">Nöbetçi eczaneler</h2><p>81 ilden birini seç, bugün için bildirilen nöbetçi eczaneleri gör.</p></div>
    </div>
    <label className="duty-city-label" htmlFor="duty-city">İl seçin</label>
    <select id="duty-city" value={city} onChange={event => void load(event.target.value)}>
      <option value="">81 ilden birini seçin</option>
      {turkiyeCities.map(item => <option key={item} value={item}>{item}</option>)}
    </select>
    {loading && <p className="duty-status" role="status">Güncel liste alınıyor…</p>}
    {error && <p className="duty-status duty-error" role="status">{error}</p>}
    {result && <>
      <p className="duty-status">Nöbet tarihi: <strong>{new Intl.DateTimeFormat('tr-TR', {dateStyle: 'long', timeZone: 'Europe/Istanbul'}).format(new Date(`${result.date}T12:00:00+03:00`))}</strong></p>
      <p className="duty-status">{result.returned} eczane gösteriliyor; seçilen ilde toplam {result.total} nöbet kaydı var.</p>
      {result.pharmacies.length ? <div className="duty-pharmacy-list">{result.pharmacies.slice(0, 8).map(pharmacy => <article className="duty-pharmacy-card" key={pharmacy.id}>
        <h3>{pharmacy.name}</h3><p>{[pharmacy.district, pharmacy.address].filter(Boolean).join(' · ') || 'Adres bilgisi paylaşılmamış'}</p>
        {pharmacy.onCall && <p className="duty-on-call">İcap nöbeti: eczane kapalı olabilir; gitmeden önce telefonla çağırın.</p>}
        <div className="duty-pharmacy-actions"><a href={pharmacy.detailUrl} target="_blank" rel="noreferrer"><MapPin size={15}/>Telefon ve yol tarifi<ArrowUpRight size={14}/></a></div>
      </article>)}</div> : <p className="duty-status">Bu il için kaynakta bugün kayıt bulunmuyor.</p>}
      {result.notice && <p className="duty-coverage-note">{result.notice}</p>}
      <p className="duty-attribution"><a href={result.attributionUrl} target="_blank" rel="noreferrer">{result.attribution}</a> · <a href={result.sourceUrl} target="_blank" rel="noreferrer">İl listesi ve tüm kayıtlar</a>. Nöbet listesi gün içinde değişebilir; gitmeden önce eczaneyi arayıp doğrulayın.</p>
    </>}
    {!city && <p className="duty-status">Nöbet listesi bulunduğunuz ile göre değişir; görmek için ilinizi seçin.</p>}
  </section>;
}

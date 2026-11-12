'use client';

import {useState} from 'react';
import {MapPin, Phone, Pill} from 'lucide-react';
import {turkiyeCities} from '@/lib/turkiye-cities';

type Pharmacy = {id: string | number; name: string; phone?: string | null; address?: string | null; district?: string | null; mapsUrl?: string};
type Result = {date: string; fetchedAt: string; pharmacies: Pharmacy[]; coverageMessage?: string; provinceSource: string; attribution: string; attributionUrl: string};

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
      <div><p className="community-kicker">GÜNCEL BÖLGE BİLGİSİ</p><h2 id="duty-pharmacies-title">Nöbetçi eczaneler</h2><p>İlini seç, bugün için bildirilen eczaneleri gör.</p></div>
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
      <p className="duty-status">Veri alındı: {new Intl.DateTimeFormat('tr-TR', {dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Istanbul'}).format(new Date(result.fetchedAt))}</p>
      {result.pharmacies.length ? <div className="duty-pharmacy-list">{result.pharmacies.slice(0, 6).map(pharmacy => <article className="duty-pharmacy-card" key={pharmacy.id}>
        <h3>{pharmacy.name}</h3><p>{[pharmacy.district, pharmacy.address].filter(Boolean).join(' · ') || 'Adres bilgisi paylaşılmamış'}</p>
        <div className="duty-pharmacy-actions">{pharmacy.phone && <a href={`tel:${pharmacy.phone}`}><Phone size={15}/>Ara</a>}{pharmacy.mapsUrl && <a href={pharmacy.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={15}/>Yol tarifi</a>}</div>
      </article>)}</div> : <p className="duty-status">Bu il için kaynakta bugüne ait kayıt bulunmuyor.</p>}
      {result.coverageMessage && <p className="duty-coverage-note">{result.coverageMessage}</p>}
      <p className="duty-attribution"><a href={result.attributionUrl} target="_blank" rel="noreferrer">{result.attribution}</a> · İl listesi: <a href={result.provinceSource} target="_blank" rel="noreferrer">kaynak sayfa</a>. Veriler günlük yenilenir; gitmeden önce eczaneyi telefonla arayıp nöbetini doğrulayın.</p>
    </>}
    {!city && <p className="duty-status">Nöbet listesi ile bulunduğunuz il değişebilir; görmek için ilinizi seçin.</p>}
  </section>;
}

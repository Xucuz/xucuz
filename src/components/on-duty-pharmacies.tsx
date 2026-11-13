'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {ArrowUpRight,MapPin,Pill} from 'lucide-react';
import {turkiyeCities} from '@/lib/turkiye-cities';

type Pharmacy = {id: string; name: string; district?: string; address?: string; onCall: boolean; detailUrl: string};
type Result = {date: string; validityStart: string; validityEnd: string; total: number; returned: number; notice?: string; sourceUrl: string; attribution: string; attributionUrl: string; pharmacies: Pharmacy[]};

function istanbulDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Istanbul'}).format(new Date(value));
}

async function fetchRoster(selectedCity: string): Promise<Result> {
  const response = await fetch(`/api/pharmacies?city=${encodeURIComponent(selectedCity)}`, {cache: 'no-store'});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Liste yüklenemedi.');
  const roster = data as Result;
  const now = Date.now();
  if (roster.date !== istanbulDate(roster.validityStart) || now < Date.parse(roster.validityStart) || now >= Date.parse(roster.validityEnd)) {
    throw new Error('Kaynağın geçerli nöbet listesi henüz hazır değil; eski liste gösterilmiyor. Yeniden kontrol edilecek.');
  }
  return roster;
}

function millisecondsUntilIstanbul0001() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  const todayAtRefresh = new Date(`${get('year')}-${get('month')}-${get('day')}T00:01:00+03:00`);
  const nextRefresh = todayAtRefresh.getTime() > now.getTime()
    ? todayAtRefresh
    : new Date(todayAtRefresh.getTime() + 24 * 60 * 60 * 1000);
  return Math.max(1000, nextRefresh.getTime() - now.getTime());
}

function normalizeDistrict(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR');
}

export function OnDutyPharmacies() {
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState('');

  const districts = useMemo(() => {
    if (!result) return [];
    const unique = new Map<string, string>();
    for (const pharmacy of result.pharmacies) {
      const value = pharmacy.district?.trim();
      if (value) unique.set(normalizeDistrict(value), value);
    }
    return [...unique.values()].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [result]);

  const visiblePharmacies = useMemo(() => {
    if (!result) return [];
    return district
      ? result.pharmacies.filter(pharmacy => normalizeDistrict(pharmacy.district ?? '') === normalizeDistrict(district))
      : result.pharmacies;
  }, [district, result]);

  const load = useCallback(async (selectedCity: string, silent = false) => {
    setCity(selectedCity);
    if (!silent) {
      setDistrict('');
      setResult(null);
      setError('');
    }
    if (!selectedCity) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      setResult(await fetchRoster(selectedCity));
      setError('');
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Liste yüklenemedi.');
    } finally {
      setLastCheckedAt(new Date().toISOString());
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!city) return;
    let lastRefreshAt = 0;
    const refresh = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastRefreshAt < 30_000) return;
      lastRefreshAt = Date.now();
      void load(city, true);
    };
    let midnightTimer = 0;
    const scheduleMidnightRefresh = () => {
      midnightTimer = window.setTimeout(() => {
        refresh();
        scheduleMidnightRefresh();
      }, millisecondsUntilIstanbul0001());
    };
    scheduleMidnightRefresh();
    const interval = window.setInterval(refresh, 15 * 60 * 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearTimeout(midnightTimer);
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [city, load]);

  useEffect(() => {
    if (!city || !result) return;
    const remaining = Date.parse(result.validityEnd) - Date.now();
    const expireAndRefresh = () => {
      setResult(null);
      void load(city, true);
    };
    if (remaining <= 0) {
      expireAndRefresh();
      return;
    }
    const timer = window.setTimeout(expireAndRefresh, remaining);
    return () => window.clearTimeout(timer);
  }, [city, load, result]);

  return <section className="duty-pharmacies" aria-labelledby="duty-pharmacies-title">
    <div className="duty-pharmacies-heading">
      <div className="duty-pharmacies-icon"><Pill size={21}/></div>
      <div><p className="community-kicker">GÜNCEL BÖLGE BİLGİSİ</p><h2 id="duty-pharmacies-title">Nöbetçi eczaneler</h2><p>Önce ilinizi, sonra listede bulunan ilçeyi seçin.</p></div>
    </div>
    <div className="duty-location-fields">
      <div>
        <label className="duty-city-label" htmlFor="duty-city">İl</label>
        <select id="duty-city" value={city} onChange={event => void load(event.target.value)}>
          <option value="">81 ilden birini seçin</option>
          {turkiyeCities.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label className="duty-city-label" htmlFor="duty-district">İlçe</label>
        <select id="duty-district" value={district} disabled={!result || districts.length === 0} onChange={event => setDistrict(event.target.value)}>
          <option value="">{result ? 'Tüm ilçeler' : 'Önce il seçin'}</option>
          {districts.map(item => <option key={normalizeDistrict(item)} value={item}>{item}</option>)}
        </select>
      </div>
    </div>
    {result && districts.length > 0 && <p className="duty-status">İlçe seçenekleri, kaynağın bu il için döndürdüğü eczane kayıtlarından oluşturuldu.</p>}
    {loading && <p className="duty-status" role="status">Güncel liste alınıyor…</p>}
    {refreshing && <p className="duty-status" role="status">Nöbet listesi güncelleniyor…</p>}
    {error && <p className="duty-status duty-error" role="status">{error}</p>}
    {result && <>
      <p className="duty-status">Kaynağın geçerlilik aralığı: <strong>{new Intl.DateTimeFormat('tr-TR', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul'}).format(new Date(result.validityStart))}</strong> – <strong>{new Intl.DateTimeFormat('tr-TR', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul'}).format(new Date(result.validityEnd))}</strong></p>
      <p className="duty-status">{visiblePharmacies.length} eczane gösteriliyor; seçilen ilde toplam {result.total} nöbet kaydı var.</p>
      {visiblePharmacies.length ? <div className="duty-pharmacy-list">{visiblePharmacies.map(pharmacy => <article className="duty-pharmacy-card" key={pharmacy.id}>
        <h3>{pharmacy.name}</h3><p>{[pharmacy.district, pharmacy.address].filter(Boolean).join(' · ') || 'Adres bilgisi paylaşılmamış'}</p>
        {pharmacy.onCall && <p className="duty-on-call">İcap nöbeti: eczane kapalı olabilir; gitmeden önce telefonla çağırın.</p>}
        <div className="duty-pharmacy-actions"><a href={pharmacy.detailUrl} target="_blank" rel="noreferrer"><MapPin size={15}/>Telefon ve yol tarifi<ArrowUpRight size={14}/></a></div>
      </article>)}</div> : <p className="duty-status">{district ? 'Kaynağın döndürdüğü listede bu ilçeye ait eczane kaydı bulunmuyor.' : 'Bu il için kaynakta bugün kayıt bulunmuyor.'}</p>}
      {result.notice && <p className="duty-coverage-note">{result.notice}</p>}
      <p className="duty-attribution"><a href={result.attributionUrl} target="_blank" rel="noreferrer">{result.attribution}</a> · <a href={result.sourceUrl} target="_blank" rel="noreferrer">İl listesi ve tüm kayıtlar</a>. Nöbet listesi gün içinde değişebilir; gitmeden önce eczaneyi arayıp doğrulayın.</p>
    </>}
    {city && lastCheckedAt && <p className="duty-status">Son kaynak kontrolü: {new Intl.DateTimeFormat('tr-TR', {timeStyle: 'short', timeZone: 'Europe/Istanbul'}).format(new Date(lastCheckedAt))} · Açık sayfada 15 dakikada bir ve her gün Türkiye saatiyle 00:01’de kontrol edilir.</p>}
    {!city && <p className="duty-status">Nöbet listesi bulunduğunuz ile göre değişir; görmek için ilinizi seçin.</p>}
  </section>;
}

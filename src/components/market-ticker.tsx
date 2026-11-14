'use client';

import {useCallback, useEffect, useState} from 'react';

type MarketData = {
  fxReferenceDate: string | null;
  eurTry: number | null;
  usdTry: number | null;
  gbpTry: number | null;
  goldTryPerGram: number | null;
  goldUpdatedAt: string | null;
};

const formatTRY = (value: number) => new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
}).format(value);

function localTime(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul',
  }).format(parsed);
}

export function MarketTicker() {
  const [data, setData] = useState<MarketData | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/markets', {cache: 'no-store'});
      if (!response.ok) throw new Error('Market data is unavailable');
      const next = await response.json() as MarketData;
      setData(next);
    } catch {
      // Keep the last good observation visible if a provider is briefly unavailable.
    } finally {
      setCheckedAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const items = data ? [
    data.usdTry ? `USD/TRY ${formatTRY(data.usdTry)} ₺` : 'USD/TRY verisi alınamadı',
    data.eurTry ? `EUR/TRY ${formatTRY(data.eurTry)} ₺` : 'EUR/TRY verisi alınamadı',
    data.gbpTry ? `GBP/TRY ${formatTRY(data.gbpTry)} ₺` : 'GBP/TRY verisi alınamadı',
    data.goldTryPerGram ? `Gram altın spot* ${formatTRY(data.goldTryPerGram)} ₺` : 'Gram altın spot verisi alınamadı',
  ] : ['Piyasa verileri yükleniyor…'];
  const checkedTime = localTime(checkedAt);
  const goldTime = localTime(data?.goldUpdatedAt ?? null);

  return <aside className="market-ticker" aria-label="Döviz referans kurları ve altın spot fiyatı">
    <span className="market-ticker-label">PİYASALAR</span>
    <div className="market-ticker-window" aria-live="polite">
      <div className="market-ticker-track">{[0, 1].map(copy => <span key={copy} className="market-ticker-group" aria-hidden={copy === 1}>
        {items.map((item, index) => <span key={index}>{item}</span>)}
        <span>{data?.fxReferenceDate ? `Döviz referans tarihi: ${data.fxReferenceDate}` : 'Döviz referans verisi bekleniyor'}</span>
        {goldTime && <span>Altın kaynağı: ${goldTime}</span>}
      </span>)}</div>
    </div>
    <span className="market-ticker-update">{checkedTime ? `Son kontrol ${checkedTime}` : 'Güncelleniyor'}</span>
    <span className="market-ticker-sources">
      <a className="market-ticker-source" href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Döviz: Frankfurter · referans</a>
      <a className="market-ticker-source" href="https://gold-api.com/faqs" target="_blank" rel="noopener noreferrer">Altın: Gold API · spot</a>
    </span>
    <span className="market-ticker-disclaimer" title="Altın spot karşılığı, perakende kuyumcu satış fiyatı değildir.">*Spot gösterge; kuyumcu satış fiyatı değildir.</span>
  </aside>;
}

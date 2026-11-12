import {NextResponse} from 'next/server';

export const revalidate = 1800;

type ForecastPoint = {
  time: string;
  data: {
    instant?: {details?: {air_temperature?: number}};
    next_1_hours?: {summary?: {symbol_code?: string}; details?: {precipitation_amount?: number}};
    next_6_hours?: {summary?: {symbol_code?: string}; details?: {precipitation_amount?: number}};
    next_12_hours?: {summary?: {symbol_code?: string}; details?: {precipitation_amount?: number}};
  };
};

function numberParam(value: string | null, min: number, max: number) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const lat = numberParam(searchParams.get('lat'), -90, 90);
  const lon = numberParam(searchParams.get('lon'), -180, 180);
  if (lat === null || lon === null) {
    return NextResponse.json({error: 'Geçerli konum koordinatları gerekli.'}, {status: 400});
  }

  try {
    const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/compact');
    url.searchParams.set('lat', lat.toFixed(4));
    url.searchParams.set('lon', lon.toFixed(4));
    const response = await fetch(url, {
      headers: {Accept: 'application/json', 'User-Agent': 'Xucuz.com/1.0 https://www.xucuz.com'},
      next: {revalidate: 1800},
    });
    if (!response.ok) {
      return NextResponse.json({error: 'Hava durumu kaynağı şu anda yanıt vermiyor.'}, {status: 502});
    }

    const payload = await response.json() as {properties?: {timeseries?: ForecastPoint[]}};
    const points = payload.properties?.timeseries ?? [];
    const byDate = new Map<string, {date: string; min: number; max: number; symbol: string; precipitation: number}>();
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
    });

    for (const point of points) {
      const temperature = point.data.instant?.details?.air_temperature;
      if (typeof temperature !== 'number') continue;
      const date = dateFormatter.format(new Date(point.time));
      const existing = byDate.get(date);
      const period = point.data.next_1_hours ?? point.data.next_6_hours ?? point.data.next_12_hours;
      const symbol = period?.summary?.symbol_code;
      const precipitation = period?.details?.precipitation_amount ?? 0;
      if (existing) {
        existing.min = Math.min(existing.min, temperature);
        existing.max = Math.max(existing.max, temperature);
        existing.precipitation += precipitation;
        if (symbol) existing.symbol = symbol;
      } else {
        byDate.set(date, {date, min: temperature, max: temperature, symbol: symbol ?? 'cloudy', precipitation});
      }
    }

    return NextResponse.json({
      days: [...byDate.values()].slice(0, 5),
      attribution: 'Weather data © MET Norway',
      attributionUrl: 'https://www.met.no/en/Weather-and-climate/Weather-forecasts/Terms-of-service',
      updatedAt: new Date().toISOString(),
    }, {headers: {'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'}});
  } catch {
    return NextResponse.json({error: 'Hava durumu bilgisi şu anda alınamıyor.'}, {status: 502});
  }
}

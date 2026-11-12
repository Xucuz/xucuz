import https from 'node:https';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {rateLimit} from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const radiusMeters = 30000;
const CACHE_MS = 15 * 60 * 1000;
const maximumResponseBytes = 20 * 1024 * 1024;
const requestSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
}).strict();

const epdkSchema = z.object({
  statusCode: z.number(),
  columnNames: z.array(z.string()).optional(),
  numRows: z.number().optional(),
  result: z.unknown().nullable().optional(),
  errors: z.array(z.unknown()).optional(),
});

type Station = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  operator: string;
  address: string;
  sockets: string;
};

type Cache = {expiresAt: number; stations: Station[]};
const cacheGlobal = globalThis as typeof globalThis & {__xucuzEpdkStationCache?: Cache; __xucuzEpdkStationFetch?: Promise<Station[]>};

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const arc = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function asRecord(row: unknown, columns: string[]) {
  if (Array.isArray(row)) return Object.fromEntries(columns.map((column, index) => [column.toLowerCase(), row[index]]));
  if (!row || typeof row !== 'object') return {};
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
}

function text(value: unknown, fallback = ''): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim().slice(0, 400);
  if (Array.isArray(value)) return value.map(entry => text(entry)).filter(Boolean).join(', ').slice(0, 400);
  if (value && typeof value === 'object') return JSON.stringify(value).slice(0, 400);
  return fallback;
}

function coordinate(value: unknown) {
  const parsed = Number(text(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRows(payload: unknown): Station[] {
  const envelope = epdkSchema.parse(payload);
  if (envelope.statusCode !== 200) throw new Error('EPDK istasyon servisi başarılı yanıt vermedi.');
  const columns = envelope.columnNames ?? [];
  let result = envelope.result;
  if (typeof result === 'string') {
    try { result = JSON.parse(result) as unknown; } catch { throw new Error('EPDK istasyon yanıtı okunamadı.'); }
  }
  if (!Array.isArray(result)) return [];
  return result.flatMap(row => {
    const data = asRecord(row, columns);
    const latitude = coordinate(data.enlem);
    const longitude = coordinate(data.boylam);
    if (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return [];
    return [{
      id: text(data.sarjistasyonuno, `${latitude},${longitude}`),
      latitude,
      longitude,
      name: text(data.sarjistasyonuadi, 'İsimsiz şarj ünitesi'),
      operator: text(data.marka || data.sarjagiisletmecisiunvan || data.sarjistasyonuisletmecisi, 'İşletmeci bilgisi belirtilmemiş'),
      address: text(data.adres),
      sockets: text(data.soketler),
    }];
  });
}

function requestEpdkStations(): Promise<Station[]> {
  return new Promise((resolve, reject) => {
    const filters = {
      lisansNo: '*',
      sarjIstasyonuNo: '*',
      markaAdi: '*',
      yesilSarjIstasyonuMu: '*',
      sarjIstasyonuAdi: '*',
      hizmetSekli: '*',
    };
    // EPDK's Swagger describes the required body as a string, although its
    // example is an object. Send the JSON filter as a JSON string to match it.
    const body = JSON.stringify(JSON.stringify(filters));
    const request = https.request('https://apigateway.epdk.gov.tr/sarjIstasyonlari/', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Xucuz/1.0 (https://www.xucuz.com)',
      },
      timeout: 12000,
    }, response => {
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > maximumResponseBytes) request.destroy(new Error('EPDK yanıt boyutu sınırı aşıldı.'));
        else chunks.push(chunk);
      });
      response.on('end', () => {
        if (response.statusCode === 429) return reject(new Error('EPDK istek sınırına ulaşıldı.'));
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) return reject(new Error('EPDK istasyon servisi şu anda yanıt vermiyor.'));
        try { resolve(parseRows(JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown)); }
        catch (error) { reject(error); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('EPDK istasyon servisi zaman aşımına uğradı.')));
    request.on('error', reject);
    request.end(body);
  });
}

async function allStations() {
  const current = cacheGlobal.__xucuzEpdkStationCache;
  if (current && current.expiresAt > Date.now()) return current.stations;
  if (cacheGlobal.__xucuzEpdkStationFetch) return cacheGlobal.__xucuzEpdkStationFetch;
  const fetchPromise = requestEpdkStations().then(stations => {
    cacheGlobal.__xucuzEpdkStationCache = {stations, expiresAt: Date.now() + CACHE_MS};
    return stations;
  }).finally(() => { cacheGlobal.__xucuzEpdkStationFetch = undefined; });
  cacheGlobal.__xucuzEpdkStationFetch = fetchPromise;
  return fetchPromise;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (!rateLimit(`nearby-charging:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({error: 'Şarj ünitesi arama sınırına ulaşıldı. Biraz sonra tekrar deneyin.'}, {status: 429});
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({error: 'Konum isteği okunamadı.'}, {status: 400}); }
  const input = requestSchema.safeParse(body);
  if (!input.success) return NextResponse.json({error: 'Geçerli bir konum alınamadı.'}, {status: 400});

  try {
    const stations = await allStations();
    const nearby = stations.flatMap(station => {
      const distance = distanceMeters(input.data.latitude, input.data.longitude, station.latitude, station.longitude);
      if (distance > radiusMeters) return [];
      return [{...station, distanceMeters: Math.round(distance), fee: 'EPDK istasyon listesinde tarife bilgisi sunulmuyor.', website: null, type: 'epdk' as const}];
    }).sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 100);
    return NextResponse.json({
      radiusMeters,
      stations: nearby,
      source: 'EPDK Şarj İstasyonları Listesi',
      attributionUrl: 'https://lisans.epdk.gov.tr/epvys-web/faces/pages/lisans/elektrikSarjAgiIsletmeci/sarjIstasyonuOzetSorgula.xhtml',
      checkedAt: new Date().toISOString(),
    }, {headers: {'Cache-Control': 'private, no-store'}});
  } catch {
    const cached = cacheGlobal.__xucuzEpdkStationCache;
    if (cached) {
      const nearby = cached.stations.flatMap(station => {
        const distance = distanceMeters(input.data.latitude, input.data.longitude, station.latitude, station.longitude);
        return distance <= radiusMeters ? [{...station, distanceMeters: Math.round(distance), fee: 'EPDK istasyon listesinde tarife bilgisi sunulmuyor.', website: null, type: 'epdk' as const}] : [];
      }).sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 100);
      return NextResponse.json({radiusMeters, stations: nearby, source: 'EPDK Şarj İstasyonları Listesi', checkedAt: new Date().toISOString(), stale: true}, {headers: {'Cache-Control': 'private, no-store'}});
    }
    return NextResponse.json({error: 'EPDK istasyon verisi şu anda alınamıyor; sahte kayıt gösterilmedi.'}, {status: 503});
  }
}

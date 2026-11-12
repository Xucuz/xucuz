import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {rateLimit} from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const radiusMeters = 30000;
const requestSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
}).strict();

const overpassSchema = z.object({
  elements: z.array(z.object({
    type: z.enum(['node', 'way', 'relation']),
    id: z.number().int().positive(),
    lat: z.number().finite().optional(),
    lon: z.number().finite().optional(),
    center: z.object({lat: z.number().finite(), lon: z.number().finite()}).optional(),
    tags: z.record(z.string(), z.string()).optional(),
  }).passthrough()),
});

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (!rateLimit(`nearby-camera:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({error: 'Konum sorgusu sınırına ulaşıldı. Biraz sonra tekrar deneyin.'}, {status: 429});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Konum isteği okunamadı.'}, {status: 400});
  }
  const input = requestSchema.safeParse(body);
  if (!input.success) return NextResponse.json({error: 'Geçerli bir konum alınamadı.'}, {status: 400});

  const {latitude, longitude} = input.data;
  const query = `[out:json][timeout:15];nwr(around:${radiusMeters},${latitude},${longitude})["highway"="speed_camera"];out center tags 50;`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch('https://overpass.osm.ch/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'Xucuz/1.0 (https://www.xucuz.com)',
      },
      body: new URLSearchParams({data: query}),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json({error: 'Harita kaynağı şu anda yanıt vermiyor. Resmî rota sorgusunu kullanabilirsiniz.'}, {status: 503});
    }
    const parsed = overpassSchema.safeParse(await response.json());
    if (!parsed.success) {
      return NextResponse.json({error: 'Harita kaynağından geçerli yanıt alınamadı.'}, {status: 502});
    }

    const cameras = parsed.data.elements
      .filter(element => element.tags?.highway === 'speed_camera')
      .flatMap(element => {
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        if (lat === undefined || lon === undefined) return [];
        const distance = distanceMeters(latitude, longitude, lat, lon);
        if (distance > radiusMeters) return [];
        return [{
          id: element.id,
          type: element.type,
          latitude: lat,
          longitude: lon,
          distanceMeters: Math.round(distance),
          label: element.tags?.name || element.tags?.ref || 'Haritada kayıtlı sabit hız kamerası',
        }];
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 50);

    return NextResponse.json({
      radiusMeters,
      cameras,
      source: 'OpenStreetMap contributors',
      attributionUrl: 'https://www.openstreetmap.org/copyright',
      checkedAt: new Date().toISOString(),
    }, {headers: {'Cache-Control': 'private, no-store'}});
  } catch {
    return NextResponse.json({error: 'Harita kaynağına şu anda ulaşılamıyor. Resmî rota sorgusunu kullanabilirsiniz.'}, {status: 503});
  } finally {
    clearTimeout(timeout);
  }
}

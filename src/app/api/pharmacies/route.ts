import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {turkiyeCities} from '@/lib/turkiye-cities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pharmacyDatasetSchema = z.object({
  status: z.string(),
  fetched_at: z.string().datetime({offset: true}),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  freshness: z.object({state: z.string(), age_seconds: z.number().nonnegative(), max_age_seconds: z.number().positive()}),
  attribution: z.object({text: z.string().min(1), url: z.string().url()}),
  data: z.object({
    coverage: z.array(z.object({
      province_id: z.string(),
      service_date: z.string(),
      status: z.string(),
      source_state: z.string(),
      source_url: z.string().url(),
      message: z.string().optional(),
    })),
    pharmacies: z.array(z.object({
      id: z.string(),
      name: z.string().min(1),
      province_id: z.string(),
      district_id: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      roster_date: z.string(),
      verified_at: z.string().datetime({offset: true}),
      source_url: z.string().url(),
      location: z.object({latitude: z.number(), longitude: z.number()}).nullable().optional(),
    })),
  }),
});

function slugifyCity(city: string) {
  return city.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i').replaceAll('ğ', 'g')
    .replaceAll('ü', 'u').replaceAll('ş', 's').replaceAll('ö', 'o').replaceAll('ç', 'c');
}

function istanbulToday() {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Istanbul'}).format(new Date());
}

function normalizePhone(value?: string | null) {
  if (!value) return undefined;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 10) digits = `0${digits}`;
  return digits.length >= 11 && digits.length <= 13 ? digits : undefined;
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('city') ?? '';
  const city = turkiyeCities.find(item => slugifyCity(item) === slugifyCity(input));
  if (!city) return NextResponse.json({error: 'Geçerli bir il seçin.'}, {status: 400});

  const today = istanbulToday();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('https://turkpidya.com/wp-json/turkpidya-data/v1/tools/datasets/pharmacies', {
      headers: {Accept: 'application/json'},
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json({error: 'Nöbetçi eczane verisi şu an alınamıyor.'}, {status: 502});
    const parsed = pharmacyDatasetSchema.safeParse(await response.json());
    if (!parsed.success) return NextResponse.json({error: 'Veri kaynağından geçerli bir yanıt alınamadı.'}, {status: 502});

    const data = parsed.data;
    const age = (Date.now() - new Date(data.fetched_at).getTime()) / 1000;
    if (data.status !== 'verified' || data.freshness.state !== 'fresh' || age < 0 || age > data.freshness.max_age_seconds || data.valid_from !== today || data.valid_until !== today) {
      return NextResponse.json({error: 'Kaynağın verisi bugünün tarihiyle doğrulanmadı; güncel liste gösterilmiyor.'}, {status: 503});
    }

    const citySlug = slugifyCity(city);
    const coverage = data.data.coverage.find(item => item.province_id === citySlug && item.service_date === today);
    if (!coverage || coverage.status === 'unavailable' || coverage.source_state !== 'current') {
      return NextResponse.json({error: `${city} için bugün doğrulanabilir nöbet listesi bu kaynakta bulunmuyor.`}, {status: 404});
    }

    const pharmacies = data.data.pharmacies
      .filter(item => item.province_id === citySlug && item.roster_date === today)
      .slice(0, 8)
      .map(item => ({
        id: item.id,
        name: item.name,
        phone: normalizePhone(item.phone),
        address: item.address,
        district: item.district_id,
        sourceUrl: item.source_url,
        verifiedAt: item.verified_at,
        mapsUrl: item.location ? `https://www.google.com/maps/search/?api=1&query=${item.location.latitude},${item.location.longitude}` : undefined,
      }));

    return NextResponse.json({
      date: today,
      fetchedAt: data.fetched_at,
      pharmacies,
      coverageMessage: coverage.message,
      provinceSource: coverage.source_url,
      attribution: data.attribution.text,
      attributionUrl: data.attribution.url,
    }, {headers: {'Cache-Control': 'no-store'}});
  } catch {
    return NextResponse.json({error: 'Nöbetçi eczane kaynağına şu an ulaşılamıyor.'}, {status: 502});
  } finally {
    clearTimeout(timeout);
  }
}

import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {turkiyeCities} from '@/lib/turkiye-cities';
import {rateLimit} from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rosterSchema = z.object({
  konum: z.string(),
  nobetGunu: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gecerlilikBaslangic: z.string().datetime({offset: true}),
  gecerlilikBitis: z.string().datetime({offset: true}),
  toplamEczane: z.number().int().nonnegative(),
  donenEczane: z.number().int().nonnegative(),
  sayfaUrl: z.string().url(),
  kaynak: z.string(),
  not: z.string().optional(),
  eczaneler: z.array(z.object({
    ad: z.string().min(1),
    il: z.string(),
    ilce: z.string().optional(),
    adres: z.string().optional(),
    icap: z.boolean().optional(),
    sayfaUrl: z.string().url(),
  })),
});

function slugifyCity(city: string) {
  return city.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i').replaceAll('ğ', 'g')
    .replaceAll('ü', 'u').replaceAll('ş', 's').replaceAll('ö', 'o').replaceAll('ç', 'c');
}

function istanbulToday() {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Istanbul'}).format(new Date());
}

function trustedPageUrl(value: string) {
  const url = new URL(value);
  return url.protocol === 'https:' && url.hostname === 'nobetcieczane.org';
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('city') ?? '';
  const city = turkiyeCities.find(item => slugifyCity(item) === slugifyCity(input));
  if (!city) return NextResponse.json({error: 'Geçerli bir il seçin.'}, {status: 400});
  if (!rateLimit('duty-pharmacy-read', 120)) return NextResponse.json({error: 'İstek sınırına ulaşıldı. Biraz sonra yeniden deneyin.'}, {status: 429});

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('https://nobetcieczane.org/mcp', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json, text/event-stream'},
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: {name: 'nobetci_eczane_listele', arguments: {il: city, limit: 100}},
      }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json({error: 'Nöbetçi eczane listesi şu an alınamıyor.'}, {status: 502});

    const body = await response.text();
    const eventData = body.split(/\r?\n/).find(line => line.startsWith('data: '))?.slice(6);
    const envelope: unknown = JSON.parse(eventData ?? body);
    const envelopeSchema = z.object({
      result: z.object({isError: z.boolean().optional(), content: z.array(z.object({text: z.string()}))}),
    });
    const parsedEnvelope = envelopeSchema.safeParse(envelope);
    if (!parsedEnvelope.success || parsedEnvelope.data.result.isError) {
      return NextResponse.json({error: 'Nöbetçi eczane kaynağından geçerli yanıt alınamadı.'}, {status: 502});
    }
    const content = parsedEnvelope.data.result.content.find(item => item.text.trim().startsWith('{'))?.text;
    if (!content) return NextResponse.json({error: 'Nöbetçi eczane kaynağında liste bulunamadı.'}, {status: 502});
    const parsedRoster = rosterSchema.safeParse(JSON.parse(content));
    if (!parsedRoster.success) return NextResponse.json({error: 'Nöbetçi eczane verisi doğrulanamadı.'}, {status: 502});

    const roster = parsedRoster.data;
    const now = Date.now();
    if (roster.nobetGunu !== istanbulToday() || now < Date.parse(roster.gecerlilikBaslangic) || now >= Date.parse(roster.gecerlilikBitis)) {
      return NextResponse.json({error: 'Kaynağın nöbet listesi bugün için geçerli değil; eski liste gösterilmiyor.'}, {status: 503});
    }
    if (!trustedPageUrl(roster.sayfaUrl) || roster.eczaneler.some(item => !trustedPageUrl(item.sayfaUrl))) {
      return NextResponse.json({error: 'Kaynak bağlantısı doğrulanamadı.'}, {status: 502});
    }

    return NextResponse.json({
      date: roster.nobetGunu,
      validityStart: roster.gecerlilikBaslangic,
      validityEnd: roster.gecerlilikBitis,
      total: roster.toplamEczane,
      returned: roster.donenEczane,
      notice: roster.not,
      sourceUrl: roster.sayfaUrl,
      attribution: 'Veri: NobetciEczane.org',
      attributionUrl: 'https://nobetcieczane.org/',
      pharmacies: roster.eczaneler.map((item, index) => ({
        id: `${slugifyCity(city)}-${index}-${slugifyCity(item.ad)}`,
        name: item.ad,
        district: item.ilce,
        address: item.adres,
        onCall: item.icap ?? false,
        detailUrl: item.sayfaUrl,
      })),
    }, {headers: {'Cache-Control': 'public, max-age=0, s-maxage=60'}});
  } catch {
    return NextResponse.json({error: 'Nöbetçi eczane kaynağına şu an ulaşılamıyor.'}, {status: 502});
  } finally {
    clearTimeout(timeout);
  }
}

import { NextResponse } from 'next/server';

export const revalidate = 900;
export const runtime = 'nodejs';

type ProviderResponse = {
  errors?: unknown;
  response?: unknown[];
};

type ProviderErrorCode = 'invalid_key' | 'plan_access' | 'quota' | 'provider_error';

function classifyProviderError(errors: unknown): ProviderErrorCode {
  const text = JSON.stringify(errors).toLowerCase();
  if (/invalid.{0,20}(key|token)|(?:key|token).{0,20}invalid|unauthori[sz]ed|forbidden/.test(text)) return 'invalid_key';
  if (/quota|rate.?limit|too many requests|requests.{0,20}(limit|exceeded)/.test(text)) return 'quota';
  if (/plan|subscription|not subscribed|not available for your/.test(text)) return 'plan_access';
  return 'provider_error';
}

const footballLive = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE']);
const basketballLive = new Set(['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT']);

function unavailable(message: string, status: number, errorCode?: ProviderErrorCode) {
  return NextResponse.json(
    { configured: true, matches: [], source: 'API-Sports', message, ...(errorCode ? { errorCode } : {}) },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET(request: Request) {
  const sport = new URL(request.url).searchParams.get('sport');
  if (sport !== 'football' && sport !== 'basketball') {
    return NextResponse.json({ error: 'Unsupported sport.' }, { status: 400 });
  }

  // Accept the existing football-specific Vercel variable as a fallback.
  const apiKey = process.env.API_SPORTS_KEY || process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        configured: false,
        matches: [],
        source: 'API-Sports',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const timezone = 'Europe/Istanbul';
  const base = sport === 'football'
    ? 'https://v3.football.api-sports.io/fixtures?live=all'
    : `https://v1.basketball.api-sports.io/games?date=${new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())}`;
  const url = `${base}&timezone=${timezone}`;

  try {
    const response = await fetch(url, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 900, tags: [`sports-${sport}-live`] },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const errorCode = response.status === 401 || response.status === 403 ? 'invalid_key'
        : response.status === 429 ? 'quota' : 'provider_error';
      return unavailable('Maç sağlayıcısı isteği reddetti.', 503, errorCode);
    }

    const payload = await response.json() as ProviderResponse;
    if (payload.errors && Object.keys(payload.errors as object).length > 0) {
      return unavailable('Maç sağlayıcısı isteği reddetti.', 503, classifyProviderError(payload.errors));
    }

    const matches = Array.isArray(payload.response) ? payload.response.filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const status = (item as { fixture?: { status?: { short?: string } }; status?: { short?: string } });
      const short = status.fixture?.status?.short ?? status.status?.short;
      return typeof short === 'string' && (sport === 'football' ? footballLive : basketballLive).has(short);
    }) : [];

    return NextResponse.json(
      { configured: true, matches, source: 'API-Sports', updatedAt: new Date().toISOString(), refreshSeconds: 900 },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' } },
    );
  } catch {
    return unavailable('Maç verisine şu anda erişilemiyor.', 503, 'provider_error');
  }
}

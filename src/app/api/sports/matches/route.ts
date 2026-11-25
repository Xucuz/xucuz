import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 60;

type Sport = 'football' | 'basketball';
type SportScoreMatch = {
  home?: string;
  away?: string;
  home_logo?: string;
  away_logo?: string;
  home_score?: string | number | null;
  away_score?: string | number | null;
  status?: string;
  status_text?: string;
  time?: string;
  competition?: string;
  url?: string;
};

function score(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchSlug(sport: Sport, path: string | undefined) {
  const prefix = `/${sport}/match/`;
  if (!path?.startsWith(prefix)) return null;
  const slug = path.slice(prefix.length).split('/')[0];
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) ? slug : null;
}

function normalizeMatch(item: SportScoreMatch, sport: Sport, index: number) {
  const slug = matchSlug(sport, item.url) ?? `${sport}-match-${index}`;
  const status = item.status?.toLowerCase() ?? 'unknown';
  const label = item.status_text ?? status;
  const date = item.time;
  return {
    fixture: sport === 'football' ? { id: slug, date, status: { short: status, long: label } } : undefined,
    game: sport === 'basketball' ? { id: slug, date, status: { short: status, long: label } } : undefined,
    league: { name: item.competition ?? '—' },
    teams: {
      home: { name: item.home ?? '—', logo: item.home_logo ?? null },
      away: { name: item.away ?? '—', logo: item.away_logo ?? null },
    },
    goals: sport === 'football' ? { home: score(item.home_score), away: score(item.away_score) } : undefined,
    scores: sport === 'basketball' ? { home: { total: score(item.home_score) }, away: { total: score(item.away_score) } } : undefined,
    sportScore: { slug, status, statusText: label, url: item.url ?? null },
  };
}

export async function GET(request: Request) {
  const sport = new URL(request.url).searchParams.get('sport');
  if (sport !== 'football' && sport !== 'basketball') {
    return NextResponse.json({ error: 'Unsupported sport.' }, { status: 400 });
  }

  try {
    const upstream = new URL('https://sportscore.com/api/widget/matches/');
    upstream.searchParams.set('sport', sport);
    upstream.searchParams.set('limit', '50');
    upstream.searchParams.set('src', 'xucuz.com');
    const response = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60, tags: [`sportscore-${sport}-matches`] },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return NextResponse.json({ configured: true, matches: [], source: 'SportScore', unavailable: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    const payload = await response.json() as { matches?: SportScoreMatch[]; updated?: string };
    const matches = (Array.isArray(payload.matches) ? payload.matches : [])
      .filter((item) => item && typeof item.home === 'string' && typeof item.away === 'string')
      .map((item, index) => normalizeMatch(item, sport, index));

    return NextResponse.json(
      { configured: true, matches, source: 'SportScore', updatedAt: payload.updated ?? new Date().toISOString(), refreshSeconds: 60 },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    );
  } catch {
    return NextResponse.json({ configured: true, matches: [], source: 'SportScore', unavailable: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 60;

type SportScoreIncident = {
  time?: number | string | null;
  type?: string | null;
  side?: string | null;
  player?: string | null;
  is_goal?: boolean;
  home_score?: number | string | null;
  away_score?: number | string | null;
};
type SportScoreStat = {
  label?: string;
  home?: number | string | null;
  away?: number | string | null;
  home_pct?: number | null;
  away_pct?: number | null;
  suffix?: string;
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const sport = params.get('sport');
  const slug = params.get('id');
  if ((sport !== 'football' && sport !== 'basketball') || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return NextResponse.json({ error: 'Unsupported match.' }, { status: 400 });
  }

  try {
    const upstream = new URL('https://sportscore.com/api/widget/match/');
    upstream.searchParams.set('sport', sport);
    upstream.searchParams.set('slug', slug);
    upstream.searchParams.set('src', 'xucuz.com');
    const response = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60, tags: [`sportscore-${sport}-match-${slug}`] },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return NextResponse.json({ configured: true, events: [], unavailable: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });

    const payload = await response.json() as {
      updated?: string;
      match?: {
        incidents?: SportScoreIncident[] | null;
        stats?: SportScoreStat[] | null;
        lineups?: unknown;
      };
    };
    const match = payload.match;
    const events = (Array.isArray(match?.incidents) ? match.incidents : []).map((event) => ({
      minute: event.time === null || event.time === undefined || !Number.isFinite(Number(event.time)) ? null : Number(event.time),
      extraMinute: null,
      team: event.side ?? null,
      player: event.player ?? null,
      assist: null,
      type: event.is_goal ? 'Goal' : event.type ?? null,
      detail: event.type ?? null,
      comments: [event.home_score, event.away_score].every((value) => value !== null && value !== undefined)
        ? `${event.home_score}–${event.away_score}` : null,
    }));
    const stats = (Array.isArray(match?.stats) ? match.stats : []).filter((stat) => typeof stat.label === 'string');

    return NextResponse.json({
      configured: true,
      events,
      stats,
      lineups: match?.lineups ?? null,
      updatedAt: payload.updated ?? new Date().toISOString(),
      source: 'SportScore',
    }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } });
  } catch {
    return NextResponse.json({ configured: true, events: [], unavailable: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

import { NextResponse } from 'next/server';

export const revalidate = 900;
export const runtime = 'nodejs';

type ProviderEvent = {
  time?: { elapsed?: number | null; extra?: number | null };
  team?: { name?: string | null; logo?: string | null };
  player?: { name?: string | null };
  assist?: { name?: string | null };
  type?: string | null;
  detail?: string | null;
  comments?: string | null;
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const sport = params.get('sport');
  const fixtureId = params.get('id');
  if (sport !== 'football' || !fixtureId || !/^\d{1,12}$/.test(fixtureId)) {
    return NextResponse.json({ error: 'Unsupported match.' }, { status: 400 });
  }

  // Accept the existing football-specific Vercel variable as a fallback.
  const apiKey = process.env.API_SPORTS_KEY || process.env.API_FOOTBALL_KEY;
  if (!apiKey) return NextResponse.json({ configured: false, events: [] }, { headers: { 'Cache-Control': 'no-store' } });

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 900, tags: [`sports-football-events-${fixtureId}`] },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return NextResponse.json({ configured: true, events: [], unavailable: true }, { status: 503 });
    const payload = await response.json() as { errors?: unknown; response?: ProviderEvent[] };
    if (payload.errors && Object.keys(payload.errors as object).length) {
      return NextResponse.json({ configured: true, events: [], unavailable: true }, { status: 503 });
    }

    const events = (Array.isArray(payload.response) ? payload.response : []).map((event) => ({
      minute: Number.isFinite(event.time?.elapsed) ? event.time?.elapsed : null,
      extraMinute: Number.isFinite(event.time?.extra) ? event.time?.extra : null,
      team: typeof event.team?.name === 'string' ? event.team.name : null,
      player: typeof event.player?.name === 'string' ? event.player.name : null,
      assist: typeof event.assist?.name === 'string' ? event.assist.name : null,
      type: typeof event.type === 'string' ? event.type : null,
      detail: typeof event.detail === 'string' ? event.detail : null,
      comments: typeof event.comments === 'string' ? event.comments : null,
    }));

    return NextResponse.json({ configured: true, events, updatedAt: new Date().toISOString(), source: 'API-Sports' }, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ configured: true, events: [], unavailable: true }, { status: 503 });
  }
}

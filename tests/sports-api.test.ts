import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as getMatches } from '@/app/api/sports/matches/route';
import { GET as getEvents } from '@/app/api/sports/events/route';

describe('sports provider routes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('does not invent match data when the provider key is missing', async () => {
    vi.stubEnv('API_SPORTS_KEY', '');
    vi.stubEnv('API_FOOTBALL_KEY', '');
    const response = await getMatches(new Request('https://xucuz.test/api/sports/matches?sport=football'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ configured: false, matches: [] });
  });

  it('rejects unsupported sports', async () => {
    const response = await getMatches(new Request('https://xucuz.test/api/sports/matches?sport=hockey'));
    expect(response.status).toBe(400);
  });

  it('returns real provider events without adding synthetic commentary', async () => {
    vi.stubEnv('API_SPORTS_KEY', 'test-only-key');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ response: [
      { time: { elapsed: 17, extra: null }, team: { name: 'Home FC' }, player: { name: 'Player One' }, type: 'Goal', detail: 'Normal Goal' },
    ] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await getEvents(new Request('https://xucuz.test/api/sports/events?sport=football&id=123'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      configured: true,
      events: [{ minute: 17, team: 'Home FC', player: 'Player One', type: 'Goal', detail: 'Normal Goal' }],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('accepts the existing API_FOOTBALL_KEY variable', async () => {
    vi.stubEnv('API_SPORTS_KEY', '');
    vi.stubEnv('API_FOOTBALL_KEY', 'test-only-key');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ response: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await getMatches(new Request('https://xucuz.test/api/sports/matches?sport=football'));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('validates event fixture IDs', async () => {
    const response = await getEvents(new Request('https://xucuz.test/api/sports/events?sport=football&id=not-a-fixture'));
    expect(response.status).toBe(400);
  });
});

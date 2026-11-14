import {afterEach, expect, it, vi} from 'vitest';
import {GET} from '../src/app/api/pixabay/videos/route';

const originalKey = process.env.PIXABAY_API_KEY;
afterEach(() => {
  if (originalKey === undefined) delete process.env.PIXABAY_API_KEY;
  else process.env.PIXABAY_API_KEY = originalKey;
  vi.unstubAllGlobals();
});

it('does not call Pixabay when its server key is missing', async () => {
  delete process.env.PIXABAY_API_KEY;
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const response = await GET();
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: 'Pixabay video servisi yapılandırılmamış.'});
  expect(fetchMock).not.toHaveBeenCalled();
});

it('returns attributed video metadata without exposing the API key', async () => {
  process.env.PIXABAY_API_KEY = 'private-test-value';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({hits: [{
    id: 42,
    pageURL: 'https://pixabay.com/videos/example-42/',
    user: 'creator',
    user_id: 7,
    tags: 'funny cat, kitten, humor',
    duration: 12,
    videos: {medium: {url: 'https://cdn.pixabay.com/example.mp4', thumbnail: 'https://cdn.pixabay.com/poster.jpg'}},
  }]}), {status: 200, headers: {'Content-Type': 'application/json'}})));

  const response = await GET();
  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.videos[0]).toMatchObject({
    id: 42,
    author: 'creator',
    authorUrl: 'https://pixabay.com/users/creator-7/',
    videoUrl: 'https://cdn.pixabay.com/example.mp4',
    thumbnailUrl: 'https://cdn.pixabay.com/poster.jpg',
    tags: ['funny cat', 'kitten', 'humor'],
  });
  const requestedUrl = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
  expect(requestedUrl.searchParams.get('order')).toBe('popular');
  expect(requestedUrl.searchParams.get('q')).toBe('funny');
  expect(requestedUrl.searchParams.get('per_page')).toBe('20');
  expect(JSON.stringify(body)).not.toContain('private-test-value');
  expect(response.headers.get('Cache-Control')).toContain('s-maxage=86400');
});

it('filters popular search results to comedy-related tags', async () => {
  process.env.PIXABAY_API_KEY = 'private-test-value';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({hits: [
    {id: 1, pageURL: 'https://pixabay.com/videos/birds-1/', user: 'creator', user_id: 7, tags: 'sparrow, bird, jump', duration: 10, videos: {medium: {url: 'https://cdn.pixabay.com/bird.mp4'}}},
    {id: 2, pageURL: 'https://pixabay.com/videos/cat-2/', user: 'creator', user_id: 7, tags: 'cute cat, funny cat, kitten', duration: 10, videos: {medium: {url: 'https://cdn.pixabay.com/cat.mp4'}}},
  ]}), {status: 200, headers: {'Content-Type': 'application/json'}})));

  const response = await GET();
  const body = await response.json();
  expect(body.videos.map((video: {id: number}) => video.id)).toEqual([2]);
});

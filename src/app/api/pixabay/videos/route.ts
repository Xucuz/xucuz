import {NextResponse} from 'next/server';

export const revalidate = 86_400;

type PixabayVideoVariant = {url?: string; thumbnail?: string};
type PixabayHit = {
  id: number;
  pageURL: string;
  user: string;
  user_id: number;
  tags: string;
  duration: number;
  videos?: {small?: PixabayVideoVariant; medium?: PixabayVideoVariant; large?: PixabayVideoVariant};
};

const comedyTag = /\b(fun(ny|nies)|comedy|comedian|humou?r|prank|joke|laugh(ter|ing)?|meme|hilarious|silly|goofy)\b/i;

export async function GET() {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    return NextResponse.json({error: 'Pixabay video servisi yapılandırılmamış.'}, {status: 503});
  }

  const params = new URLSearchParams({
    key,
    q: 'funny',
    lang: 'en',
    video_type: 'film',
    safesearch: 'true',
    order: 'popular',
    per_page: '20',
  });

  try {
    const response = await fetch(`https://pixabay.com/api/videos/?${params}`, {
      next: {revalidate},
      headers: {Accept: 'application/json'},
    });
    if (!response.ok) {
      return NextResponse.json({error: 'Pixabay videoları şu anda alınamıyor.'}, {status: 502});
    }

    const payload = await response.json() as {hits?: PixabayHit[]};
    const videos = (payload.hits ?? []).flatMap((hit) => {
      if (!comedyTag.test(hit.tags)) return [];
      const variant = hit.videos?.medium ?? hit.videos?.small ?? hit.videos?.large;
      if (!variant?.url || !hit.pageURL || !hit.user) return [];
      return [{
        id: hit.id,
        videoUrl: variant.url,
        thumbnailUrl: variant.thumbnail ?? hit.videos?.large?.thumbnail ?? null,
        pageUrl: hit.pageURL,
        author: hit.user,
        authorUrl: `https://pixabay.com/users/${encodeURIComponent(hit.user)}-${hit.user_id}/`,
        tags: hit.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 3),
        duration: hit.duration,
      }];
    }).slice(0, 4);

    return NextResponse.json({videos}, {
      headers: {'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'},
    });
  } catch {
    return NextResponse.json({error: 'Pixabay videoları şu anda alınamıyor.'}, {status: 502});
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleNews, getGoogleTrends, getTrendRegion } from '@/lib/google-trends';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get('term') ?? '').trim().replace(/\s+/g, ' ');
  const geo = (request.nextUrl.searchParams.get('geo') ?? '').trim().toUpperCase();
  const region = getTrendRegion(geo);
  if (!term || term.length > 120 || !region) return NextResponse.json({ error: 'invalid_term_or_region' }, { status: 400 });

  try {
    const trending = await getGoogleTrends();
    const selected = trending.find((item) => item.geo === region.geo && item.term.toLocaleLowerCase(region.locale) === term.toLocaleLowerCase(region.locale));
    if (!selected) {
      return NextResponse.json({ error: 'term_not_currently_trending' }, { status: 404 });
    }
    const articles = await getGoogleNews(term, region);
    return NextResponse.json({ term, region, featuredImage: selected.imageUrl, articles }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'news_temporarily_unavailable' }, { status: 503 });
  }
}

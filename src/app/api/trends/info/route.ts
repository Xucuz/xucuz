import { NextRequest, NextResponse } from 'next/server';
import { getGoogleNews, getGoogleTrends } from '@/lib/google-trends';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get('term') ?? '').trim().replace(/\s+/g, ' ');
  if (!term || term.length > 120) return NextResponse.json({ error: 'invalid_term' }, { status: 400 });

  try {
    const trending = await getGoogleTrends();
    if (!trending.some((item) => item.term.toLocaleLowerCase('tr-TR') === term.toLocaleLowerCase('tr-TR'))) {
      return NextResponse.json({ error: 'term_not_currently_trending' }, { status: 404 });
    }
    return NextResponse.json({ term, articles: await getGoogleNews(term) }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'news_temporarily_unavailable' }, { status: 503 });
  }
}

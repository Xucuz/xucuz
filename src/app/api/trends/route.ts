import { NextResponse } from 'next/server';
import { getGoogleTrends } from '@/lib/google-trends';
import { localizedTrendPath } from '@/lib/trend-locales';

export const revalidate = 300;

export async function GET() {
  try {
    const terms=await getGoogleTrends();
    return NextResponse.json({ provider: 'Google Trends', terms: terms.map(trend=>({...trend,href:localizedTrendPath('tr',trend)})) }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ provider: 'Google Trends', terms: [], error: 'trends_temporarily_unavailable' }, { status: 503 });
  }
}

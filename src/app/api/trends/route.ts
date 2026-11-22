import { NextResponse } from 'next/server';
import { getTurkeyGoogleTrends } from '@/lib/google-trends';
import { localizedTrendPath } from '@/lib/trend-locales';
import {turkeyShoppingTrends} from '@/lib/shopping-trends';

export const revalidate = 300;

export async function GET() {
  try {
    const terms=turkeyShoppingTrends(await getTurkeyGoogleTrends());
    return NextResponse.json({ provider: 'Google Trends Türkiye', topic: 'shopping-products', terms: terms.map(trend=>({...trend,href:localizedTrendPath('tr',trend)})) }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ provider: 'Google Trends Türkiye', topic: 'shopping-products', terms: [], error: 'trends_temporarily_unavailable' }, { status: 503 });
  }
}

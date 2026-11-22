import { NextResponse } from 'next/server';
import { getGoogleTrends } from '@/lib/google-trends';

export const revalidate = 300;

export async function GET() {
  try {
    return NextResponse.json({ provider: 'Google Trends', terms: await getGoogleTrends() }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ provider: 'Google Trends', terms: [], error: 'trends_temporarily_unavailable' }, { status: 503 });
  }
}

import {NextResponse} from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 30;

type FrankfurterData = {date: string; rates: Record<string, number>};
type GoldApiData = {price?: unknown; updatedAt?: unknown; timestamp?: unknown};

function validPositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

async function fetchFx(): Promise<{date: string; eurTry: number; usdTry: number; gbpTry: number} | null> {
  try {
    const response = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD,GBP', {
      next: {revalidate: 300},
    });
    if (!response.ok) return null;
    const data = await response.json() as FrankfurterData;
    const rates = data.rates;
    if (!data.date || !validPositive(rates?.TRY) || !validPositive(rates?.USD) || !validPositive(rates?.GBP)) return null;
    return {date: data.date, eurTry: rates.TRY, usdTry: rates.TRY / rates.USD, gbpTry: rates.TRY / rates.GBP};
  } catch {
    return null;
  }
}

async function fetchGold(): Promise<{eurPerOunce: number; updatedAt: string | null} | null> {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU/EUR', {next: {revalidate: 30}});
    if (!response.ok) return null;
    const data = await response.json() as GoldApiData;
    if (!validPositive(data.price)) return null;
    const timestamp = typeof data.updatedAt === 'string' ? data.updatedAt
      : typeof data.timestamp === 'string' ? data.timestamp : null;
    return {eurPerOunce: data.price, updatedAt: timestamp};
  } catch {
    return null;
  }
}

export async function GET() {
  const [fx, gold] = await Promise.all([fetchFx(), fetchGold()]);
  const goldTryPerGram = fx && gold ? gold.eurPerOunce * fx.eurTry / 31.1034768 : null;

  if (!fx && !gold) {
    return NextResponse.json({error: 'Piyasa kaynaklarından veri alınamadı.'}, {
      status: 502,
      headers: {'Cache-Control': 'no-store'},
    });
  }

  return NextResponse.json({
    fxReferenceDate: fx?.date ?? null,
    eurTry: fx?.eurTry ?? null,
    usdTry: fx?.usdTry ?? null,
    gbpTry: fx?.gbpTry ?? null,
    goldTryPerGram,
    goldUpdatedAt: gold?.updatedAt ?? null,
    checkedAt: new Date().toISOString(),
    fxSourceType: 'reference',
    goldSourceType: 'spot',
  }, {headers: {'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30'}});
}

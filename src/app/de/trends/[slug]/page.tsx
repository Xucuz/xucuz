import { makeTrendDetailMetadata, TrendDetailPage } from '@/components/trends-locale-page';
import type { Metadata } from 'next';
import type { TrendLocale } from '@/lib/trend-locales';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return makeTrendDetailMetadata('de', (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return TrendDetailPage({ locale: 'de' as TrendLocale, slug: (await params).slug }); }

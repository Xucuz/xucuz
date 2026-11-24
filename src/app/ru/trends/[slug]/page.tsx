import { makeTrendDetailMetadata, TrendDetailPage } from '@/components/trends-locale-page';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return makeTrendDetailMetadata('ru', (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return TrendDetailPage({ locale: 'ru', slug: (await params).slug }); }

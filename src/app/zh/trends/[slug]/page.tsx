import { makeTrendDetailMetadata, TrendDetailPage } from '@/components/trends-locale-page';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return makeTrendDetailMetadata('zh', (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return TrendDetailPage({ locale: 'zh', slug: (await params).slug }); }

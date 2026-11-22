import { makeTrendsIndexMetadata, TrendsLocalePage } from '@/components/trends-locale-page';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> { return makeTrendsIndexMetadata('tr', searchParams); }
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return TrendsLocalePage({ locale: 'tr', searchParams }); }

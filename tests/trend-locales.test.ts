import { describe, expect, it, vi } from 'vitest';
import { categoryForTrend, filterTrends, hreflangAlternates, localizedTrendPath, TREND_LOCALES, trendSlug } from '@/lib/trend-locales';
import { makeTrendsIndexMetadata } from '@/components/trends-locale-page';

const rows = [
  { geo: 'TR', locale: 'tr-TR', language: 'tr', term: 'Galatasaray maçı', publishedAt: '2026-11-22T10:00:00.000Z' },
  { geo: 'US', locale: 'en-US', language: 'en', term: 'OpenAI new model', publishedAt: '2026-11-21T10:00:00.000Z' },
  { geo: 'DE', locale: 'de-DE', language: 'de', term: 'Bundestag election', publishedAt: '2026-11-22T10:00:00.000Z' },
];

describe('global trends locale and SEO helpers', () => {
  it('creates stable readable and collision-resistant locale URLs', () => {
    const trend = rows[0]!;
    expect(trendSlug(trend)).toMatch(/^galatasaray-maci-tr-[a-f0-9]{8}$/);
    expect(localizedTrendPath('tr', trend)).toBe(`/tr/trends/${trendSlug(trend)}`);
    expect(localizedTrendPath('en', trend)).toBe(`/en/trends/${trendSlug(trend)}`);
    expect(trendSlug({ ...trend, geo: 'US' })).not.toBe(trendSlug(trend));
  });

  it('filters country, language, inferred category, and source date', () => {
    expect(filterTrends(rows, { geo: 'TR' })).toHaveLength(1);
    expect(filterTrends(rows, { language: 'en' })).toHaveLength(1);
    expect(filterTrends(rows, { category: 'sports' })).toHaveLength(1);
    expect(filterTrends(rows, { date: '2026-11-22' })).toHaveLength(2);
    expect(categoryForTrend('Galatasaray maçı')).toBe('sports');
  });

  it('emits all eight language alternates and x-default', () => {
    expect(hreflangAlternates((locale) => `/${locale}/trends/example`)).toEqual({ languages: {
      tr: '/tr/trends/example', en: '/en/trends/example', de: '/de/trends/example', es: '/es/trends/example', ru: '/ru/trends/example', fr: '/fr/trends/example', ar: '/ar/trends/example', zh: '/zh/trends/example', 'x-default': '/en/trends/example',
    } });
    expect(TREND_LOCALES).toHaveLength(8);
  });

  it('canonicalizes filtered landing pages and marks them noindex', async () => {
    const clean = await makeTrendsIndexMetadata('tr', Promise.resolve({}));
    const filtered = await makeTrendsIndexMetadata('tr', Promise.resolve({ geo: 'TR' }));
    expect(clean.alternates?.canonical).toBe('/tr');
    expect(clean.alternates?.languages).toMatchObject({ tr: '/tr', en: '/en', de: '/de', es: '/es', ru: '/ru', fr: '/fr', ar: '/ar', zh: '/zh' });
    expect(filtered.alternates?.canonical).toBe('/tr');
    expect(filtered.robots).toMatchObject({ index: false, follow: true });
  });

  it('keeps Vercel Preview pages out of search indexes', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    try {
      const preview = await makeTrendsIndexMetadata('en', Promise.resolve({}));
      expect(preview.robots).toMatchObject({ index: false, follow: true });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

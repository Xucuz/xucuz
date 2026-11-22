import { createHash } from 'node:crypto';
import type { GoogleTrend } from '@/lib/google-trends';

export const TREND_LOCALES = ['tr', 'en', 'de', 'es'] as const;
export type TrendLocale = (typeof TREND_LOCALES)[number];

export const TREND_CATEGORIES = ['technology', 'sports', 'entertainment', 'politics', 'business', 'other'] as const;
export type TrendCategory = (typeof TREND_CATEGORIES)[number];

const CATEGORY_TERMS: Record<TrendCategory, string[]> = {
  technology: ['ai', 'artificial intelligence', 'iphone', 'android', 'google', 'openai', 'tech', 'teknoloji', 'yapay zeka', 'kiünstliche intelligenz', 'tecnología'],
  sports: ['football', 'soccer', 'match', 'champions', 'league', 'nba', 'nfl', 'f1', 'formula 1', 'futbol', 'maç', 'şampiyonlar ligi', 'spiel', 'fußball', 'fútbol', 'partido'],
  entertainment: ['movie', 'film', 'series', 'episode', 'music', 'singer', 'actor', 'actress', 'dizi', 'film', 'şarkıcı', 'oyuncu', 'serie', 'película', 'música', 'schauspieler'],
  politics: ['election', 'president', 'government', 'minister', 'parliament', 'seçim', 'cumhurbaşkanı', 'hükümet', 'bakan', 'wahl', 'präsident', 'elecciones', 'presidente', 'gobierno'],
  business: ['stock', 'market', 'economy', 'price', 'bitcoin', 'crypto', 'borsa', 'ekonomi', 'fiyat', 'aktie', 'wirtschaft', 'mercado', 'economía'],
  other: [],
};

export const TREND_COPY = {
  tr: {
    name: 'Türkçe', title: 'Dünya ve Türkiye trendleri', description: 'Türkiye ve dünyada Google Trends’te öne çıkan aramaları ülke, dil, konu ve tarihe göre keşfedin.',
    kicker: 'KAYNAKLI CANLI KEŞİF', intro: 'Türkiye ve dünya aramalarını kaynağından takip edin.', country: 'Ülke', language: 'Dil', category: 'Konu grubu', date: 'Tarih', all: 'Tümü', apply: 'Filtrele', source: 'Kaynak: Google Trends', updated: 'Kaynakta yayımlanma', volume: 'Yaklaşık arama ilgisi', read: 'Trend ayrıntısını aç', back: 'Tüm trendlere dön', related: 'İlgili güncel aramalar', context: 'Bu arama Google Trends’in herkese açık bölgesel akışında yer aldı. Gösterilen arama ilgisi Google’ın yaklaşık değeridir; satış veya pazar payı verisi değildir.', news: 'İlgili haber başlıkları', noNews: 'Bu terim için kaynak akışında şu anda ilgili haber başlığı bulunmuyor.', empty: 'Bu filtrelerle eşleşen güncel trend yok.', categoryNote: 'Konu grubu, arama ifadesinden otomatik çıkarılmış yaklaşık bir sınıflandırmadır.', approx: 'yaklaşık', home: 'Ana sayfa', geo: 'Bölge', updatedAt: 'Son kaynak zamanı', trendIndex: 'Trend keşfi',
    categories: { technology: 'Teknoloji', sports: 'Spor', entertainment: 'Eğlence', politics: 'Siyaset', business: 'İş ve ekonomi', other: 'Diğer' },
  },
  en: {
    name: 'English', title: 'Global and Türkiye trends', description: 'Explore searches highlighted by Google Trends in Türkiye and around the world by country, language, topic and date.',
    kicker: 'SOURCE-BASED DISCOVERY', intro: 'Follow searches in Türkiye and around the world from their source.', country: 'Country', language: 'Language', category: 'Topic group', date: 'Date', all: 'All', apply: 'Filter', source: 'Source: Google Trends', updated: 'Published by source', volume: 'Approximate search interest', read: 'Open trend details', back: 'Back to all trends', related: 'Related current searches', context: 'This search appeared in Google Trends’ public regional feed. Search interest is an approximate Google value, not sales or market-share data.', news: 'Related news headlines', noNews: 'There are no related headlines in the source feed at this time.', empty: 'No current trends match these filters.', categoryNote: 'Topic group is an approximate classification inferred from the search phrase.', approx: 'approx.', home: 'Home', geo: 'Region', updatedAt: 'Latest source time', trendIndex: 'Trend discovery',
    categories: { technology: 'Technology', sports: 'Sports', entertainment: 'Entertainment', politics: 'Politics', business: 'Business & economy', other: 'Other' },
  },
  de: {
    name: 'Deutsch', title: 'Trends weltweit und in der Türkei', description: 'Entdecken Sie Suchanfragen aus Google Trends in der Türkei und weltweit nach Land, Sprache, Thema und Datum.',
    kicker: 'QUELLENBASIERTE ENTDECKUNG', intro: 'Verfolgen Sie Suchanfragen in der Türkei und weltweit direkt aus der Quelle.', country: 'Land', language: 'Sprache', category: 'Thema', date: 'Datum', all: 'Alle', apply: 'Filtern', source: 'Quelle: Google Trends', updated: 'Von der Quelle veröffentlicht', volume: 'Ungefähres Suchinteresse', read: 'Trenddetails öffnen', back: 'Zurück zu allen Trends', related: 'Ähnliche aktuelle Suchanfragen', context: 'Diese Suchanfrage erschien im öffentlichen regionalen Feed von Google Trends. Das Suchinteresse ist ein Näherungswert von Google, keine Verkaufs- oder Marktanteilsangabe.', news: 'Verwandte Schlagzeilen', noNews: 'Derzeit gibt es keine passenden Schlagzeilen im Quellenfeed.', empty: 'Keine aktuellen Trends für diese Filter.', categoryNote: 'Die Themengruppe ist eine ungefähre, aus der Suchphrase abgeleitete Einordnung.', approx: 'ca.', home: 'Startseite', geo: 'Region', updatedAt: 'Letzte Quellenzeit', trendIndex: 'Trends entdecken',
    categories: { technology: 'Technologie', sports: 'Sport', entertainment: 'Unterhaltung', politics: 'Politik', business: 'Wirtschaft', other: 'Sonstiges' },
  },
  es: {
    name: 'Español', title: 'Tendencias globales y de Turquía', description: 'Descubre búsquedas destacadas de Google Trends en Turquía y el mundo por país, idioma, tema y fecha.',
    kicker: 'DESCUBRIMIENTO CON FUENTES', intro: 'Sigue las búsquedas de Turquía y del mundo desde su fuente.', country: 'País', language: 'Idioma', category: 'Tema', date: 'Fecha', all: 'Todos', apply: 'Filtrar', source: 'Fuente: Google Trends', updated: 'Publicado por la fuente', volume: 'Interés de búsqueda aproximado', read: 'Abrir detalles de tendencia', back: 'Volver a todas las tendencias', related: 'Búsquedas actuales relacionadas', context: 'Esta búsqueda apareció en el feed regional público de Google Trends. El interés es un valor aproximado de Google, no representa ventas ni cuota de mercado.', news: 'Titulares relacionados', noNews: 'El feed de origen no tiene titulares relacionados en este momento.', empty: 'No hay tendencias actuales con estos filtros.', categoryNote: 'El tema es una clasificación aproximada inferida de la frase de búsqueda.', approx: 'aprox.', home: 'Inicio', geo: 'Región', updatedAt: 'Última actualización de la fuente', trendIndex: 'Explorar tendencias',
    categories: { technology: 'Tecnología', sports: 'Deportes', entertainment: 'Entretenimiento', politics: 'Política', business: 'Negocios y economía', other: 'Otros' },
  },
} as const;

export function isTrendLocale(value: string): value is TrendLocale {
  return (TREND_LOCALES as readonly string[]).includes(value);
}

export function categoryForTrend(term: string): TrendCategory {
  const normalized = term.normalize('NFKC').toLocaleLowerCase();
  for (const category of TREND_CATEGORIES.slice(0, -1)) {
    if (CATEGORY_TERMS[category].some((word) => normalized.includes(word))) return category;
  }
  return 'other';
}

export function trendSlug(trend: Pick<GoogleTrend, 'term' | 'geo'>): string {
  const readable = trend.term.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'trend';
  const hash = createHash('sha256').update(`${trend.geo.toUpperCase()}\0${trend.term.normalize('NFKC').toLocaleLowerCase()}`).digest('hex').slice(0, 8);
  return `${readable}-${trend.geo.toLowerCase()}-${hash}`;
}

export function localizedTrendPath(locale: TrendLocale, trend: Pick<GoogleTrend, 'term' | 'geo'>): string {
  return `/${locale}/trends/${trendSlug(trend)}`;
}

export function findTrendBySlug<T extends GoogleTrend>(trends: T[], slug: string): T | undefined {
  return trends.find((trend) => trendSlug(trend) === slug);
}

export function filterTrends<T extends GoogleTrend>(
  trends: T[],
  filters: { geo?: string; language?: string; category?: string; date?: string },
): T[] {
  return trends.filter((trend) => {
    if (filters.geo && trend.geo !== filters.geo.toUpperCase()) return false;
    if (filters.language && trend.language !== filters.language) return false;
    if (filters.category && categoryForTrend(trend.term) !== filters.category) return false;
    if (filters.date && trend.publishedAt?.slice(0, 10) !== filters.date) return false;
    return true;
  });
}

export function countryName(geo: string, locale: TrendLocale): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(geo) ?? geo;
  } catch {
    return geo;
  }
}

export function localizedDate(value: string | undefined, locale: TrendLocale): string {
  if (!value || Number.isNaN(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

export function hreflangAlternates(pathForLocale: (locale: TrendLocale) => string) {
  const languages = Object.fromEntries(TREND_LOCALES.map((locale) => [locale, pathForLocale(locale)]));
  return { languages: { ...languages, 'x-default': pathForLocale('en') } };
}

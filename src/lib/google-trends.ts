import { unstable_cache } from 'next/cache';

export type TrendRegion = {
  geo: string;
  locale: string;
  language: string;
};

export type GoogleTrend = TrendRegion & {
  term: string;
  traffic?: string;
  imageUrl?: string;
  relatedTitle?: string;
  publishedAt?: string;
};

export type GoogleNewsItem = {
  title: string;
  url: string;
  source: string;
  summary: string;
  imageUrl?: string;
  publishedAt?: string;
};

const TREND_REGIONS: TrendRegion[] = [
  { geo: 'US', locale: 'en-US', language: 'en' },
  { geo: 'IN', locale: 'hi-IN', language: 'hi' },
  { geo: 'TR', locale: 'tr-TR', language: 'tr' },
  { geo: 'FR', locale: 'fr-FR', language: 'fr' },
  { geo: 'DE', locale: 'de-DE', language: 'de' },
  { geo: 'ES', locale: 'es-ES', language: 'es' },
  { geo: 'BR', locale: 'pt-BR', language: 'pt' },
  { geo: 'JP', locale: 'ja-JP', language: 'ja' },
  { geo: 'KR', locale: 'ko-KR', language: 'ko' },
  { geo: 'ID', locale: 'id-ID', language: 'id' },
  { geo: 'SA', locale: 'ar-SA', language: 'ar' },
  { geo: 'RU', locale: 'ru-RU', language: 'ru' },
  { geo: 'IT', locale: 'it-IT', language: 'it' },
  { geo: 'TH', locale: 'th-TH', language: 'th' },
  { geo: 'NL', locale: 'nl-NL', language: 'nl' },
  { geo: 'PL', locale: 'pl-PL', language: 'pl' },
];

const TREND_URL = 'https://trends.google.com/trending/rss?geo=';
const NEWS_URL = 'https://news.google.com/rss/search?';
const GOOGLE_IMAGE_HOSTS = ['googleusercontent.com', 'gstatic.com'];
let lastGoodTrends: GoogleTrend[] = [];
const lastGoodByRegion = new Map<string, GoogleTrend[]>();

function decodeCodePoint(raw: string, radix: number): string {
  const code = parseInt(raw, radix);
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
}

function decodeEntities(value: string): string {
  return value.replace(/&#(\d+);/g, (_, code: string) => decodeCodePoint(code, 10))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => decodeCodePoint(code, 16))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&nbsp;/gi, ' ');
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<(?:(?:[\\w-]+):)?${name}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[\\w-]+):)?${name}\\s*>`, 'i'));
  return match?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() ?? '';
}

function cleanText(value: string): string {
  const decoded = decodeEntities(value.replace(/<!\[CDATA\[|\]\]>/g, ''));
  return decodeEntities(decoded.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function googleImage(candidate: string): string | undefined {
  try {
    const url = new URL(decodeEntities(candidate.trim()));
    const isGoogleImage = GOOGLE_IMAGE_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    return url.protocol === 'https:' && isGoogleImage ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function rssImage(block: string): string | undefined {
  const media = block.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*\burl=["']([^"']+)["']/i)?.[1];
  const description = decodeEntities(tag(block, 'description'));
  const inline = description.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
  const candidate = media ?? inline;
  return candidate ? googleImage(candidate) : undefined;
}

async function fetchRegion(region: TrendRegion): Promise<GoogleTrend[]> {
  const response = await fetch(`${TREND_URL}${region.geo}`, {
    headers: { 'user-agent': 'Xucuz/1.0 (+https://xucuz.com; Google Trends RSS reader)' },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Google Trends RSS returned ${response.status} for ${region.geo}`);
  return parseGoogleTrendsRss(await response.text(), region);
}

/** Combines public Google Trends RSS feeds from 16 markets and native-language locales. */
async function fetchGlobalTrends(): Promise<GoogleTrend[]> {
  const settled = await Promise.allSettled(TREND_REGIONS.map(fetchRegion));
  const feeds = settled.map((result, index) => {
    const region = TREND_REGIONS[index]!;
    if (result.status === 'fulfilled' && result.value.length > 0) {
      lastGoodByRegion.set(region.geo, result.value);
      return result.value;
    }
    return lastGoodByRegion.get(region.geo) ?? [];
  });
  const output: GoogleTrend[] = [];
  const seen = new Set<string>();
  const longestFeed = Math.max(0, ...feeds.map((feed) => feed.length));

  // Interleave locales so the global board does not get dominated by one country.
  for (let rank = 0; rank < longestFeed; rank += 1) {
    for (const feed of feeds) {
      const item = feed[rank];
      if (!item) continue;
      const key = item.term.normalize('NFKC').toLocaleLowerCase(item.locale);
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(item);
    }
  }

  if (output.length === 0) {
    if (lastGoodTrends.length > 0) return lastGoodTrends;
    throw new Error('No Google Trends regional feeds are available');
  }
  lastGoodTrends = output.slice(0, 96);
  return lastGoodTrends;
}

const cachedGlobalTrends = unstable_cache(fetchGlobalTrends, ['xucuz-global-trends-v1'], {
  revalidate: 300,
  tags: ['global-trends'],
});

export async function getGoogleTrends(): Promise<GoogleTrend[]> {
  try {
    return await cachedGlobalTrends();
  } catch (error) {
    // Next's data cache keeps the most recent successful value during failed revalidation.
    // This process-level fallback also covers transient failures within a warm instance.
    if (lastGoodTrends.length > 0) return lastGoodTrends;
    throw error;
  }
}

export function parseGoogleTrendsRss(xml: string, region: TrendRegion = TREND_REGIONS[0]!): GoogleTrend[] {
  return Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi), ([, rawBlock]) => {
    const block = rawBlock ?? '';
    const related = tag(block, 'news_item');
    const itemImage = googleImage(tag(related, 'news_item_picture'));
    const term = cleanText(tag(block, 'title'));
    const traffic = cleanText(tag(block, 'approx_traffic'));
    const relatedTitle = cleanText(tag(related, 'news_item_title'));
    const publishedAt = cleanText(tag(block, 'pubDate'));
    const validPublishedAt = publishedAt && !Number.isNaN(Date.parse(publishedAt)) ? new Date(publishedAt).toISOString() : undefined;
    return { ...region, term, ...(traffic ? { traffic } : {}), ...(itemImage ? { imageUrl: itemImage } : {}), ...(relatedTitle ? { relatedTitle } : {}), ...(validPublishedAt ? { publishedAt: validPublishedAt } : {}) };
  }).filter(({ term }) => term.length > 0).slice(0, 30);
}

export function getTrendRegion(geo: string): TrendRegion | undefined {
  return TREND_REGIONS.find((region) => region.geo === geo.toUpperCase());
}

export async function getGoogleNews(term: string, region: TrendRegion): Promise<GoogleNewsItem[]> {
  const params = new URLSearchParams({ q: term, hl: region.locale, gl: region.geo, ceid: `${region.geo}:${region.language}` });
  const response = await fetch(`${NEWS_URL}${params}`, {
    headers: { 'user-agent': 'Xucuz/1.0 (+https://xucuz.com; Google News RSS reader)' },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Google News RSS returned ${response.status}`);
  return parseGoogleNewsRss(await response.text());
}

export function parseGoogleNewsRss(xml: string): GoogleNewsItem[] {
  return Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi), ([, rawBlock]) => {
    const block = rawBlock ?? '';
    const title = cleanText(tag(block, 'title'));
    const url = decodeEntities(tag(block, 'link')).trim();
    const sourceMatch = block.match(/<source\b[^>]*>([\s\S]*?)<\/source>/i);
    const source = sourceMatch ? cleanText(sourceMatch[1] ?? '') : 'Google News';
    const summary = cleanText(tag(block, 'description'));
    const imageUrl = rssImage(block);
    const publishedAt = cleanText(tag(block, 'pubDate'));
    return { title, url, source, summary, ...(imageUrl ? { imageUrl } : {}), ...(publishedAt ? { publishedAt } : {}) };
  }).filter((item) => {
    try { return !!item.title && new URL(item.url).protocol === 'https:' && new URL(item.url).hostname === 'news.google.com'; }
    catch { return false; }
  }).slice(0, 8);
}

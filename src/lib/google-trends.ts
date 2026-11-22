export type GoogleTrend = { term: string; traffic?: string };
export type GoogleNewsItem = { title: string; url: string; source: string; summary: string; publishedAt?: string };

const TRENDS_URL = 'https://trends.google.com/trending/rss?geo=TR';
const NEWS_URL = 'https://news.google.com/rss/search?hl=tr&gl=TR&ceid=TR:tr&q=';

function decodeCodePoint(raw: string, radix: number): string {
  const code = parseInt(raw, radix);
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
}

function decodeEntities(value: string): string {
  return value.replace(/&#(\d+);/g, (_, code: string) => decodeCodePoint(code, 10))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => decodeCodePoint(code, 16))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'");
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<(?:(?:[\\w-]+):)?${name}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[\\w-]+):)?${name}\\s*>`, 'i'));
  return match?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() ?? '';
}

function cleanText(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/<!\[CDATA\[|\]\]>/g, ''))
    .replace(/\s+/g, ' ').trim();
}

export async function getGoogleTrends(): Promise<GoogleTrend[]> {
  const response = await fetch(TRENDS_URL, {
    headers: { 'user-agent': 'Xucuz/1.0 (+https://xucuz.com; Google Trends RSS reader)' },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Google Trends RSS returned ${response.status}`);
  return parseGoogleTrendsRss(await response.text());
}

export function parseGoogleTrendsRss(xml: string): GoogleTrend[] {
  return Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi), ([, block]) => {
    const term = cleanText(tag(block ?? '', 'title'));
    const traffic = cleanText(tag(block ?? '', 'approx_traffic'));
    return { term, ...(traffic ? { traffic } : {}) };
  }).filter(({ term }) => term.length > 0).slice(0, 30);
}

export async function getGoogleNews(term: string): Promise<GoogleNewsItem[]> {
  const response = await fetch(`${NEWS_URL}${encodeURIComponent(term)}`, {
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
    const source = sourceMatch ? cleanText(sourceMatch[1] ?? '') : 'Google Haberler';
    const summary = cleanText(tag(block, 'description'));
    const publishedAt = cleanText(tag(block, 'pubDate'));
    return { title, url, source, summary, ...(publishedAt ? { publishedAt } : {}) };
  }).filter((item) => item.title && /^https:\/\//i.test(item.url)).slice(0, 6);
}

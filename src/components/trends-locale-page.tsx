import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Globe2, Search } from 'lucide-react';
import { getGoogleNews, getGoogleTrends, getTrendRegion, type GoogleTrend } from '@/lib/google-trends';
import {
  categoryForTrend,
  countryName,
  findTrendBySlug,
  filterTrends,
  hreflangAlternates,
  localizedDate,
  localizedTrendPath,
  TREND_CATEGORIES,
  TREND_COPY,
  TREND_LOCALES,
  type TrendCategory,
  type TrendLocale,
} from '@/lib/trend-locales';
import { mode } from '@/lib/providers/engine';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xucuz.com';

function trendEvidenceDescription(locale: TrendLocale, trend: GoogleTrend) {
  const country = countryName(trend.geo, locale);
  const traffic = trend.traffic;
  const date = localizedDate(trend.publishedAt, locale);
  if (locale === 'tr') return `${country} için “${trend.term}” araması Google Trends’in herkese açık bölgesel akışında listeleniyor. Kaynak yaklaşık arama ilgisini ${traffic ?? 'belirtmiyor'} olarak veriyor; bu değer satış veya pazar payı değildir. Kaynak zamanı: ${date}.`;
  if (locale === 'de') return `Die Suche „${trend.term}“ wird für ${country} im öffentlichen Regionalfeed von Google Trends aufgeführt. Die Quelle nennt ein ungefähres Suchinteresse von ${traffic ?? 'keinen Wert'}; dies ist keine Verkaufs- oder Marktanteilsangabe. Quellenzeit: ${date}.`;
  if (locale === 'es') return `La búsqueda «${trend.term}» aparece para ${country} en el feed regional público de Google Trends. La fuente indica un interés aproximado de ${traffic ?? 'sin valor disponible'}; no representa ventas ni cuota de mercado. Hora de la fuente: ${date}.`;
  return `The search “${trend.term}” is listed for ${country} in Google Trends’ public regional feed. The source reports approximate search interest as ${traffic ?? 'not provided'}; this is not sales or market-share data. Source time: ${date}.`;
}

export async function makeTrendsIndexMetadata(locale: TrendLocale, searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<Metadata> {
  const copy = TREND_COPY[locale];
  const params = await searchParams;
  const hasFilters = Object.values(params).some((value) => Array.isArray(value) ? value.some(Boolean) : Boolean(value));
  const canonical = `/${locale}`;
  const index = mode() !== 'demo' && process.env.VERCEL_ENV !== 'preview' && !hasFilters;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical, ...hreflangAlternates((target) => `/${target}`) },
    robots: { index, follow: true, googleBot: { index, follow: true, 'max-image-preview': 'large' } },
    openGraph: { type: 'website', locale: { tr: 'tr_TR', en: 'en_US', de: 'de_DE', es: 'es_ES' }[locale], url: canonical, title: copy.title, description: copy.description, siteName: 'Xucuz' },
  };
}

export async function TrendsLocalePage({ locale, searchParams }: {
  locale: TrendLocale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const copy = TREND_COPY[locale];
  let trends: GoogleTrend[] = [];
  let unavailable = false;
  try { trends = await getGoogleTrends(); } catch { unavailable = true; }

  const raw = await searchParams;
  const value = (key: string) => typeof raw[key] === 'string' ? raw[key] as string : '';
  const geo = value('geo').toUpperCase();
  const language = value('language');
  const category = value('category');
  const date = value('date');
  const filtered = filterTrends(trends, {
    ...(geo ? { geo } : {}), ...(language ? { language } : {}),
    ...(TREND_CATEGORIES.includes(category as TrendCategory) ? { category } : {}),
    ...(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
  });
  const countries = [...new Set(trends.map((trend) => trend.geo))].sort();
  const languages = [...new Set(trends.map((trend) => trend.language))].sort();

  return <div className="trend-page wrap">
    <nav className="trend-local-nav" aria-label={copy.home}>
      <Link href="/" className="trend-brand" aria-label="Xucuz">XUCUZ<span> WORLD</span></Link>
      <div className="trend-languages" aria-label="Language">
      {TREND_LOCALES.map((target) => <Link key={target} href={`/${target}`} lang={target} aria-current={target === locale ? 'page' : undefined}>{TREND_COPY[target].name}</Link>)}
      </div>
    </nav>
    <header className="trend-page-heading">
      <p className="eyebrow"><Globe2 size={16} aria-hidden="true" /> {copy.kicker}</p>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
    </header>
    <form className="trend-filters" method="get" action={`/${locale}`} aria-label={copy.title}>
      <label>{copy.country}<select name="geo" defaultValue={geo}><option value="">{copy.all}</option>{countries.map((code) => <option key={code} value={code}>{countryName(code, locale)} ({code})</option>)}</select></label>
      <label>{copy.language}<select name="language" defaultValue={language}><option value="">{copy.all}</option>{languages.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
      <label>{copy.category}<select name="category" defaultValue={category}><option value="">{copy.all}</option>{TREND_CATEGORIES.map((item) => <option key={item} value={item}>{copy.categories[item]}</option>)}</select></label>
      <label>{copy.date}<input name="date" type="date" defaultValue={date} /></label>
      <button type="submit"><Search size={17} aria-hidden="true" />{copy.apply}</button>
    </form>
    <p className="trend-category-note">{copy.categoryNote}</p>
    {unavailable && <div className="trend-empty" role="status">{locale === 'tr' ? 'Trend kaynağına şu anda ulaşılamıyor. Son geçerli önbellek de bulunamadı; lütfen daha sonra tekrar deneyin.' : locale === 'de' ? 'Die Trendquelle ist momentan nicht erreichbar und es sind keine gültigen Cache-Daten verfügbar.' : locale === 'es' ? 'La fuente de tendencias no está disponible y no hay datos válidos en caché.' : 'The trend source is temporarily unavailable and no valid cached data is available.'}</div>}
    {!unavailable && filtered.length === 0 && <div className="trend-empty" role="status">{copy.empty}</div>}
    <section className="trend-grid" aria-label={copy.title}>
      {filtered.map((trend) => {
        const category = categoryForTrend(trend.term);
        return <article className="trend-card" key={`${trend.geo}:${trend.term}`}>
          <div className="trend-card-body">
            <div className="trend-card-meta"><span>{countryName(trend.geo, locale)}</span><span lang={trend.language}>{trend.language.toUpperCase()}</span><span>{copy.categories[category]}</span></div>
            <h2 lang={trend.language}><Link href={localizedTrendPath(locale, trend)}>{trend.term}</Link></h2>
            {trend.relatedTitle && <p className="trend-related" lang={trend.language}>{trend.relatedTitle}</p>}
            <div className="trend-card-foot"><time dateTime={trend.publishedAt}>{localizedDate(trend.publishedAt, locale)}</time>{trend.traffic && <span>{copy.approx} {trend.traffic}</span>}</div>
            <Link className="trend-card-link" href={localizedTrendPath(locale, trend)}>{copy.read}<ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </article>;
      })}
    </section>
    <footer className="trend-source-note">{copy.source}. {locale === 'tr' ? 'Google Trends arama ilgisi yaklaşık veridir; Xucuz fiyat, satış veya nedensellik iddiası üretmez.' : locale === 'de' ? 'Das Suchinteresse ist ein Näherungswert; Xucuz leitet daraus keine Preise, Verkäufe oder Ursachen ab.' : locale === 'es' ? 'El interés de búsqueda es aproximado; Xucuz no inventa precios, ventas ni causas.' : 'Search interest is approximate; Xucuz does not infer prices, sales, or causes from it.'}</footer>
  </div>;
}

export async function makeTrendDetailMetadata(locale: TrendLocale, slug: string): Promise<Metadata> {
  const copy = TREND_COPY[locale];
  let trend: GoogleTrend | undefined;
  try { trend = findTrendBySlug(await getGoogleTrends(), slug); } catch { /* stale cached page may still be rendered by Next */ }
  if (!trend) return { title: copy.trendIndex, robots: { index: false, follow: true } };
  const title = locale === 'tr' ? `${trend.term}: güncel trend ve kaynaklar` : locale === 'de' ? `${trend.term}: aktueller Trend und Quellen` : locale === 'es' ? `${trend.term}: tendencia actual y fuentes` : `${trend.term}: current trend and sources`;
  const description = `${trendEvidenceDescription(locale, trend)} ${trend.relatedTitle ?? ''}`.trim().slice(0, 300);
  const path = localizedTrendPath(locale, trend);
  return {
    title, description,
    alternates: { canonical: path, ...hreflangAlternates((target) => localizedTrendPath(target, trend!)) },
    openGraph: { type: 'article', locale: { tr: 'tr_TR', en: 'en_US', de: 'de_DE', es: 'es_ES' }[locale], url: path, title, description, siteName: 'Xucuz' },
    robots: { index: mode() !== 'demo' && process.env.VERCEL_ENV !== 'preview', follow: true, googleBot: { index: mode() !== 'demo' && process.env.VERCEL_ENV !== 'preview', follow: true, 'max-image-preview': 'large' } },
  };
}

function localizedDetailCopy(locale: TrendLocale) {
  return TREND_COPY[locale];
}

export async function TrendDetailPage({ locale, slug }: { locale: TrendLocale; slug: string }) {
  const copy = localizedDetailCopy(locale);
  let trends: GoogleTrend[];
  try { trends = await getGoogleTrends(); } catch { notFound(); }
  const trend = findTrendBySlug(trends, slug);
  if (!trend) notFound();
  const region = getTrendRegion(trend.geo);
  if (!region) notFound();
  let articles: Awaited<ReturnType<typeof getGoogleNews>> = [];
  try { articles = await getGoogleNews(trend.term, region); } catch { /* Keep the validated trend page available if News is unavailable. */ }
  const category = categoryForTrend(trend.term);
  const related = trends.filter((item) => item.geo === trend.geo && item.term !== trend.term && categoryForTrend(item.term) === category).slice(0, 6);
  const path = localizedTrendPath(locale, trend);
  const evidenceDescription = trendEvidenceDescription(locale, trend);
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article', headline: trend.term,
    description: evidenceDescription, inLanguage: locale,
    ...(trend.publishedAt ? { datePublished: trend.publishedAt, dateModified: trend.publishedAt } : {}),
    mainEntityOfPage: `${baseUrl}${path}`, isBasedOn: `https://trends.google.com/trending/rss?geo=${trend.geo}`,
    publisher: { '@type': 'Organization', name: 'Xucuz', url: baseUrl },
  };
  const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');

  return <article className="trend-page wrap trend-detail" itemScope itemType="https://schema.org/Article">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    <nav className="trend-local-nav" aria-label={copy.home}><Link href="/" className="trend-brand" aria-label="Xucuz">XUCUZ<span> WORLD</span></Link><div className="trend-languages" aria-label="Language">{TREND_LOCALES.map((target) => <Link key={target} href={`/${target}`} lang={target} aria-current={target === locale ? 'page' : undefined}>{TREND_COPY[target].name}</Link>)}</div></nav>
    <nav className="trend-breadcrumb" aria-label="Breadcrumb"><Link href={`/${locale}`}>{copy.home}</Link><span aria-hidden="true">/</span><span>{copy.trendIndex}</span></nav>
    <Link href={`/${locale}`} className="trend-back"><ArrowLeft size={17} aria-hidden="true" />{copy.back}</Link>
    <header className="trend-detail-heading">
      <p className="eyebrow">{copy.source} · {countryName(trend.geo, locale)} · {trend.language.toUpperCase()}</p>
      <h1 itemProp="headline" lang={trend.language}>{trend.term}</h1>
      <p className="trend-context" itemProp="description">{evidenceDescription}</p>
      {trend.relatedTitle && <p className="trend-detail-related" lang={trend.language}>{trend.relatedTitle}</p>}
      <div className="trend-stats"><div><span>{copy.geo}</span><strong>{countryName(trend.geo, locale)}</strong></div><div><span>{copy.category}</span><strong>{copy.categories[category]}</strong></div><div><span>{copy.updated}</span><strong>{trend.publishedAt ? <time itemProp="datePublished" dateTime={trend.publishedAt}>{localizedDate(trend.publishedAt, locale)}</time> : '—'}</strong></div>{trend.traffic && <div><span>{copy.volume}</span><strong>{copy.approx} {trend.traffic}</strong></div>}</div>
      <a className="trend-source-link" href={`https://trends.google.com/trending/rss?geo=${encodeURIComponent(trend.geo)}`} target="_blank" rel="noopener noreferrer">{copy.source}<ArrowUpRight size={15} aria-hidden="true" /></a>
    </header>
    <section className="trend-news-section"><h2>{copy.news}</h2>
      {articles.length ? <ul className="trend-news-list">{articles.map((article) => <li key={article.url}>
        <div><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}<ArrowUpRight size={15} aria-hidden="true" /></a><p>{article.source} · {localizedDate(article.publishedAt, locale)}</p></div>
      </li>)}</ul> : <p className="trend-empty">{copy.noNews}</p>}
    </section>
    {related.length > 0 && <section className="trend-related-section"><h2>{copy.related}</h2><div className="trend-related-grid">{related.map((item) => <Link key={item.geo + item.term} href={localizedTrendPath(locale, item)} lang={item.language}><span>{countryName(item.geo, locale)}</span><strong>{item.term}</strong></Link>)}</div></section>}
    <footer className="trend-source-note">{copy.source}. {copy.context}</footer>
  </article>;
}

export function supportedTrendLocale(locale: string): locale is TrendLocale {
  return (TREND_LOCALES as readonly string[]).includes(locale);
}

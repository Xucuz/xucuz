'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { GoogleTrend } from '@/lib/google-trends';

type Trend = GoogleTrend & {href:string};
type TrendArticle = { title: string; source: string; summary: string; url: string; imageUrl?: string; publishedAt?: string };
type Topic = { trend: Trend; articles: TrendArticle[]; featuredImage?: string };

function TrendImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // Google Trends/News RSS only exposes images served by Google's image hosts.
  return <Image className={className} src={src} alt={alt} width={640} height={360} unoptimized loading="lazy" referrerPolicy="no-referrer" />;
}

export function XucuzWorldHome({initialTrends,initialSourceUnavailable}:{initialTrends:Trend[];initialSourceUnavailable:boolean}) {
  const [trends, setTrends] = useState<Trend[]>(initialTrends);
  const [displayed, setDisplayed] = useState<Trend[]>(initialTrends.slice(0,12));
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [sourceUnavailable,setSourceUnavailable]=useState(initialSourceUnavailable);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const nextTrend = useRef(12);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/trends', { cache: 'no-store' });
        if (!response.ok) throw new Error('Google Trends Türkiye unavailable');
        const result = await response.json() as { terms?: Trend[] };
        if (!cancelled) {
          const next = result.terms ?? [];
          setTrends(next);
          setDisplayed(next.slice(0, 12));
          setSourceUnavailable(false);
          nextTrend.current = 12;
        }
      } catch {
        if(!cancelled)setSourceUnavailable(true);
      } finally {
        if (!cancelled) setLoadingTrends(false);
      }
    };
    if(initialTrends.length===0)void load();
    const refresh = window.setInterval(() => void load(), 300000);
    return () => { cancelled = true; window.clearInterval(refresh); };
  }, [initialTrends.length]);

  useEffect(() => {
    if (trends.length <= displayed.length) return;
    const timer = window.setInterval(() => {
      const replacement = trends[nextTrend.current % trends.length];
      if (!replacement) return;
      const slot = nextTrend.current % 12;
      nextTrend.current += 1;
      setDisplayed((current) => {
        if (current.length < 12) return current;
        const next = [...current];
        next[slot] = replacement;
        return next;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [trends, displayed.length]);

  const openTopic = useCallback(async (trend: Trend) => {
    setLoadingTopic(true);
    setTopic({ trend, articles: [], ...(trend.imageUrl ? { featuredImage: trend.imageUrl } : {}) });
    try {
      const params = new URLSearchParams({ term: trend.term, geo: trend.geo });
      const response = await fetch(`/api/trends/info?${params}`, { cache: 'no-store' });
      const result = await response.json() as { articles?: TrendArticle[]; featuredImage?: string };
      if (response.ok) setTopic({ trend, articles: result.articles ?? [], ...(result.featuredImage ? { featuredImage: result.featuredImage } : {}) });
    } catch {
      // Keep the topic open and show the source-unavailable state.
    } finally {
      setLoadingTopic(false);
    }
  }, []);

  useEffect(() => {
    if (!topic) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setTopic(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [topic]);

  return <div className="trends-home">
    <h1 className="trends-home-sr-only">Türkiye’de yükselen alışveriş ürünü aramaları</h1>
    <div className="trends-home-layout">
      <div className="trends-home-art">
        <Image className="trends-home-mascot" src="/xucuz-genie-globe.webp" alt="Dönen dünyaya dokunan Xucuz cin maskotu" width={745} height={1089} priority sizes="(max-width: 700px) 74vw, 36vw" />
        <div className="trends-home-globe" aria-hidden="true" />
      </div>

      {displayed.length > 0 ? <section className="trends-home-grid" aria-label="Google Trends Türkiye’de yükselen alışveriş ürünü aramaları">
        {displayed.map((trend, index) => <Link className="trends-home-card" key={`${trend.geo}:${trend.term}`} href={trend.href} onClick={(event)=>{event.preventDefault();void openTopic(trend);}} aria-label={`${trend.term}, ${trend.geo}; konu bilgisini aç`}>
          {trend.imageUrl ? <TrendImage className="trends-home-card-photo" src={trend.imageUrl} alt="" /> : <span className={`trends-home-card-art trends-home-card-art-${index % 6}`} aria-hidden="true"><span>{trend.geo}</span></span>}
          <span className="trends-home-card-copy">
            <span className="trends-home-card-region">{trend.geo} · {trend.language.toUpperCase()}</span>
            <strong>{trend.term}</strong>
            {trend.traffic && <small>Yaklaşık arama ilgisi: {trend.traffic}</small>}
          </span>
        </Link>)}
      </section> : <div className="trends-home-status" role="status">{loadingTrends ? 'Türkiye alışveriş trendleri yükleniyor…' : sourceUnavailable ? 'Google Trends Türkiye akışına şu anda ulaşılamıyor; doğrulanmış son akış da bulunamadı.' : 'Türkiye trend akışında şu anda ürün alışverişiyle açıkça ilişkili yükselen arama bulunmuyor.'}</div>}
    </div>

    {topic && <div className="trends-topic-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setTopic(null); }}>
      <section className="trends-topic-dialog" role="dialog" aria-modal="true" aria-labelledby="trends-topic-title">
        <button type="button" className="trends-topic-close" onClick={() => setTopic(null)} aria-label="Kapat"><X size={21} /></button>
        <p className="trends-topic-region">{topic.trend.geo} · {topic.trend.language.toUpperCase()} · Google Trends</p>
        <h2 id="trends-topic-title">{topic.trend.term}</h2>
        {topic.trend.relatedTitle && <p className="trends-topic-related">{topic.trend.relatedTitle}</p>}
        {loadingTopic ? <p className="trends-topic-state" role="status">Bilgiler yükleniyor…</p> : topic.articles.length ? <>
          <p className="trends-topic-caption">İlgili haberler ve kaynakların sağladığı fotoğraflar</p>
          {topic.featuredImage && <TrendImage className="trends-topic-featured-photo" src={topic.featuredImage} alt={`${topic.trend.term} konusu için Google Trends görseli`} />}
          <div className="trends-topic-articles">{topic.articles.map((article) => <article key={article.url}>
            {article.imageUrl && <TrendImage className="trends-topic-article-photo" src={article.imageUrl} alt="" />}
            <div><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
              {article.summary && <p>{article.summary}</p>}
              <small>{article.source}{article.publishedAt ? ` · ${article.publishedAt}` : ''}</small>
            </div>
          </article>)}</div>
          {!topic.featuredImage && !topic.articles.some((article) => article.imageUrl) && <p className="trends-topic-state">Google’ın kaynak akışı bu başlık için fotoğraf sağlamadı.</p>}
        </> : <p className="trends-topic-state">Bu arama konusu için şu anda haber bilgisi bulunamadı.</p>}
      </section>
    </div>}
  </div>;
}

'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Trend = { term: string; traffic?: string };
type TrendArticle = { title: string; source: string; summary: string; url: string; publishedAt?: string };
type Topic = { term: string; articles: TrendArticle[] };

export function XucuzWorldHome() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [active, setActive] = useState(0);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/trends', { cache: 'no-store' });
        if (!response.ok) throw new Error('Trends unavailable');
        const result = await response.json() as { terms?: Trend[] };
        if (!cancelled) {
          const next = result.terms ?? [];
          setTrends(next);
          setActive((current) => next.length ? current % next.length : 0);
        }
      } catch {
        // Keep the last successfully loaded trend list if the source is temporarily unavailable.
      }
    };
    void load();
    const refresh = window.setInterval(() => void load(), 300000);
    return () => { cancelled = true; window.clearInterval(refresh); };
  }, []);

  useEffect(() => {
    if (trends.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % trends.length), 5000);
    return () => window.clearInterval(timer);
  }, [trends.length]);

  const openTopic = useCallback(async (term: string) => {
    setLoadingTopic(true);
    setTopic({ term, articles: [] });
    try {
      const response = await fetch(`/api/trends/info?term=${encodeURIComponent(term)}`, { cache: 'no-store' });
      const result = await response.json() as { articles?: TrendArticle[] };
      if (response.ok) setTopic({ term, articles: result.articles ?? [] });
    } catch {
      // The dialog remains open with a truthful no-results state.
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

  const current = trends[active];

  return <div className="trends-home">
    <h1 className="trends-home-sr-only">Xucuz</h1>
    <div className="trends-home-art">
      <Image className="trends-home-mascot" src="/xucuz-genie-globe.webp" alt="Dönen dünyanın üzerinde duran Xucuz cin maskotu" width={745} height={1089} priority sizes="(max-width: 700px) 100vw, 70vh" />
      <div className="trends-home-globe" aria-hidden="true" />
      {current && <button className="trends-home-term" key={current.term} type="button" onClick={() => void openTopic(current.term)} aria-label={`${current.term} hakkında bilgi al`}>
        <span>{current.term}</span>
      </button>}
    </div>

    {topic && <div className="trends-topic-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setTopic(null); }}>
      <section className="trends-topic-dialog" role="dialog" aria-modal="true" aria-labelledby="trends-topic-title">
        <button type="button" className="trends-topic-close" onClick={() => setTopic(null)} aria-label="Kapat"><X size={21} /></button>
        <h2 id="trends-topic-title">{topic.term}</h2>
        {loadingTopic ? <p className="trends-topic-state" role="status">Bilgiler yükleniyor…</p> : topic.articles.length ? <>
          <p className="trends-topic-caption">Google Haberler kaynaklarından öne çıkanlar</p>
          <div className="trends-topic-articles">{topic.articles.map((article) => <article key={article.url}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
            {article.summary && <p>{article.summary}</p>}
            <small>{article.source}{article.publishedAt ? ` · ${article.publishedAt}` : ''}</small>
          </article>)}</div>
        </> : <p className="trends-topic-state">Bu arama konusu için şu anda haber bilgisi bulunamadı.</p>}
      </section>
    </div>}
  </div>;
}

'use client';

import {useEffect, useState} from 'react';
import {ArrowUpRight, Clapperboard} from 'lucide-react';

type Video = {
  id: number;
  videoUrl: string;
  thumbnailUrl: string | null;
  pageUrl: string;
  author: string;
  authorUrl: string;
  tags: string[];
  duration: number;
};

export function PixabayVideoShowcase() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/pixabay/videos', {cache: 'no-store', signal: controller.signal});
        if (!response.ok) throw new Error('Pixabay videos unavailable');
        const data = await response.json() as {videos?: Video[]};
        const items = data.videos ?? [];
        setVideos(items);
        setStatus(items.length ? 'ready' : 'empty');
      } catch {
        if (!controller.signal.aborted) setStatus((current) => current === 'loading' ? 'error' : current);
      }
    };

    void loadVideos();
    const refreshTimer = window.setInterval(() => void loadVideos(), 60_000);
    return () => { controller.abort(); window.clearInterval(refreshTimer); };
  }, []);

  return <section className="pixabay-showcase wrap" aria-labelledby="pixabay-showcase-title">
    <div className="pixabay-showcase-heading">
      <span className="pixabay-showcase-icon"><Clapperboard size={20}/></span>
      <div>
        <p className="community-kicker">DÜNYADAN EĞLENCE</p>
        <h2 id="pixabay-showcase-title">Global komik videolar</h2>
        <p>Pixabay’de popüler komedi klipleri. Liste dakikada bir kontrol edilir; kaynak verisi günde bir kez güncellenebilir.</p>
      </div>
    </div>

    {status === 'loading' && <p className="pixabay-showcase-message" role="status">Videolar yükleniyor…</p>}
    {status === 'empty' && <p className="pixabay-showcase-message" role="status">Şu anda gösterilecek video bulunamadı.</p>}
    {status === 'error' && <p className="pixabay-showcase-message" role="status">Videolar şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.</p>}
    {status === 'ready' && <div className="pixabay-video-grid">
      {videos.map((video) => <article className="pixabay-video-card" key={video.id}>
        <video controls playsInline preload="none" poster={video.thumbnailUrl ?? undefined} aria-label={`${video.tags.join(', ') || 'Pixabay videosu'} — ${video.author}`}>
          <source src={video.videoUrl} type="video/mp4"/>
        </video>
        <div className="pixabay-video-caption">
          <span>{video.tags.join(' · ') || 'Kısa video'}</span>
          <a href={video.authorUrl} target="_blank" rel="noreferrer">Pixabay · {video.author}<ArrowUpRight size={13}/></a>
        </div>
      </article>)}
    </div>}
    <p className="pixabay-showcase-credit">Videolar: <a href="https://pixabay.com/videos/" target="_blank" rel="noreferrer">Pixabay</a>. Her klip kendi üreticisiyle birlikte belirtilir.</p>
  </section>;
}

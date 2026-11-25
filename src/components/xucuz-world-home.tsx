'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Radio, Trophy } from 'lucide-react';
import { useLanguage, type Language } from './language-provider';

type Sport = 'football' | 'basketball';
type Match = {
  fixture?: { id?: string; status?: { short?: string; long?: string } };
  game?: { id?: string; status?: { short?: string; long?: string } };
  league?: { name?: string };
  teams?: { home?: { name?: string }; away?: { name?: string } };
  goals?: { home?: number | null; away?: number | null };
  scores?: { home?: { total?: number | null }; away?: { total?: number | null } };
  sportScore?: { slug?: string; status?: string; statusText?: string };
};
type MatchFeed = { matches?: Match[]; updatedAt?: string; source?: string };
type MatchEvent = { minute: number | null; player: string | null; team: string | null; type: string | null; detail: string | null };
type EventFeed = { events?: MatchEvent[]; unavailable?: boolean };

const copy: Record<Language, Record<string, string>> = {
  tr: { title: 'Xucuz canlı maç merkezi', live: 'CANLI', matches: 'Canlı maçlar', stadium: 'Stadyum', football: 'Futbol', basketball: 'Basketbol', upcoming: 'Yakında', finished: 'Bitti', noMatches: 'Şu an gösterilecek maç yok.', noEvents: 'Maç olayı bekleniyor.', source: 'SportScore', refresh: 'Yenile', select: 'Maç seç' },
  en: { title: 'Xucuz live match center', live: 'LIVE', matches: 'Live matches', stadium: 'Stadium', football: 'Football', basketball: 'Basketball', upcoming: 'Upcoming', finished: 'Finished', noMatches: 'No matches to show right now.', noEvents: 'Waiting for match events.', source: 'SportScore', refresh: 'Refresh', select: 'Select a match' },
  de: { title: 'Xucuz Live-Spielzentrum', live: 'LIVE', matches: 'Live-Spiele', stadium: 'Stadion', football: 'Fußball', basketball: 'Basketball', upcoming: 'Demnächst', finished: 'Beendet', noMatches: 'Derzeit keine Spiele verfügbar.', noEvents: 'Warte auf Spielereignisse.', source: 'SportScore', refresh: 'Aktualisieren', select: 'Spiel wählen' },
  es: { title: 'Centro de partidos Xucuz', live: 'EN VIVO', matches: 'Partidos en vivo', stadium: 'Estadio', football: 'Fútbol', basketball: 'Baloncesto', upcoming: 'Próximo', finished: 'Finalizado', noMatches: 'No hay partidos disponibles ahora.', noEvents: 'Esperando eventos del partido.', source: 'SportScore', refresh: 'Actualizar', select: 'Elegir partido' },
  ru: { title: 'Центр матчей Xucuz', live: 'В ЭФИРЕ', matches: 'Матчи', stadium: 'Стадион', football: 'Футбол', basketball: 'Баскетбол', upcoming: 'Скоро', finished: 'Завершён', noMatches: 'Сейчас нет доступных матчей.', noEvents: 'Ожидание событий матча.', source: 'SportScore', refresh: 'Обновить', select: 'Выбрать матч' },
  fr: { title: 'Centre de matchs Xucuz', live: 'EN DIRECT', matches: 'Matchs en direct', stadium: 'Stade', football: 'Football', basketball: 'Basket', upcoming: 'À venir', finished: 'Terminé', noMatches: 'Aucun match disponible pour le moment.', noEvents: 'En attente des événements.', source: 'SportScore', refresh: 'Actualiser', select: 'Choisir un match' },
  ar: { title: 'مركز مباريات Xucuz', live: 'مباشر', matches: 'المباريات المباشرة', stadium: 'الملعب', football: 'كرة القدم', basketball: 'كرة السلة', upcoming: 'قريباً', finished: 'انتهت', noMatches: 'لا توجد مباريات متاحة الآن.', noEvents: 'بانتظار أحداث المباراة.', source: 'SportScore', refresh: 'تحديث', select: 'اختر مباراة' },
  zh: { title: 'Xucuz 实时赛事中心', live: '直播', matches: '实时比赛', stadium: '球场', football: '足球', basketball: '篮球', upcoming: '即将开始', finished: '已结束', noMatches: '目前没有可显示的比赛。', noEvents: '等待比赛事件。', source: 'SportScore', refresh: '刷新', select: '选择比赛' },
};

function idOf(match: Match) {
  return match.sportScore?.slug ?? match.fixture?.id ?? match.game?.id ?? '';
}

function scoreOf(match: Match, sport: Sport) {
  return sport === 'football'
    ? [match.goals?.home, match.goals?.away]
    : [match.scores?.home?.total, match.scores?.away?.total];
}

function isLive(match: Match) {
  return match.sportScore?.status === 'live';
}

export function XucuzWorldHome() {
  const { language } = useLanguage();
  const t = copy[language];
  const [sport, setSport] = useState<Sport>('football');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [eventData, setEventData] = useState<{ matchId: string; events: MatchEvent[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadMatches = useCallback(async (selectedSport: Sport) => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/sports/matches?sport=${selectedSport}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('match feed unavailable');
      const result = await response.json() as MatchFeed;
      const items = Array.isArray(result.matches) ? result.matches : [];
      setMatches(items);
      setSelectedId((current) => current && items.some((match) => idOf(match) === current) ? current : idOf(items.find(isLive) ?? items[0] ?? {}));
    } catch {
      setFailed(true);
      setMatches([]);
      setSelectedId('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMatches(sport), 0);
    return () => window.clearTimeout(timer);
  }, [sport, loadMatches]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadMatches(sport);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [sport, loadMatches]);

  const orderedMatches = useMemo(() => [...matches].sort((a, b) => Number(isLive(b)) - Number(isLive(a))), [matches]);
  const selected = orderedMatches.find((match) => idOf(match) === selectedId);
  const events = eventData?.matchId === selectedId ? eventData.events : [];
  const [homeScore, awayScore] = selected ? scoreOf(selected, sport) : [null, null];
  const home = selected?.teams?.home?.name ?? '—';
  const away = selected?.teams?.away?.name ?? '—';
  const statusText = selected ? (isLive(selected) ? t.live : selected.sportScore?.status === 'finished' ? t.finished : selected.sportScore?.statusText ?? t.upcoming) : '';

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const loadEvents = async () => {
      try {
        const response = await fetch(`/api/sports/events?sport=${sport}&id=${encodeURIComponent(selectedId)}`, { cache: 'no-store' });
        const result = await response.json() as EventFeed;
        if (!cancelled) setEventData({ matchId: selectedId, events: response.ok && Array.isArray(result.events) ? result.events : [] });
      } catch {
        if (!cancelled) setEventData({ matchId: selectedId, events: [] });
      }
    };
    void loadEvents();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadEvents();
    }, 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [selectedId, sport]);

  return <div className="trends-home home-sports-home">
    <h1 className="trends-home-sr-only">{t.title}</h1>
    <div className="home-match-stage">
      <section className="home-match-panel home-match-list-panel" aria-label={t.matches}>
        <div className="home-match-panel-heading"><span><Radio size={15}/>{t.matches}</span><button type="button" onClick={() => void loadMatches(sport)} disabled={loading} aria-label={t.refresh}><RefreshCw size={15} className={loading ? 'spinning' : ''}/></button></div>
        <div className="home-sport-switch" role="tablist" aria-label={t.select}>
          {(['football', 'basketball'] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={sport === item} className={sport === item ? 'active' : ''} onClick={() => { setSport(item); setSelectedId(''); }}>{item === 'football' ? t.football : t.basketball}</button>)}
        </div>
        {failed ? <p className="home-match-empty">{t.noMatches}</p> : !orderedMatches.length ? <p className="home-match-empty">{loading ? '…' : t.noMatches}</p> : <div className="home-match-list">
          {orderedMatches.slice(0, 7).map((match) => {
            const [scoreHome, scoreAway] = scoreOf(match, sport);
            const live = isLive(match);
            return <button key={idOf(match)} type="button" className={`home-match-row${idOf(match) === selectedId ? ' selected' : ''}`} onClick={() => setSelectedId(idOf(match))}>
              <span className={`home-match-state${live ? ' live' : ''}`}>{live ? <><i/> {t.live}</> : match.sportScore?.status === 'finished' ? t.finished : t.upcoming}</span>
              <span className="home-match-teams"><b>{match.teams?.home?.name ?? '—'}</b><b>{match.teams?.away?.name ?? '—'}</b></span>
              <span className="home-match-result">{scoreHome ?? '–'}<small>:</small>{scoreAway ?? '–'}</span>
              <small className="home-match-league">{match.league?.name ?? ''}</small>
            </button>;
          })}
        </div>}
        <a className="home-match-source" href="https://sportscore.com/" target="_blank" rel="dofollow">{t.source}</a>
      </section>

      <div className="trends-home-art home-genie-art">
        <Image className="trends-home-mascot" src="/xucuz-genie-globe.webp" alt="Xucuz dönen dünyayı gösteren mavi cin maskotu" width={745} height={1089} priority sizes="(max-width: 760px) 52vw, 30vw" />
        <div className="trends-home-globe" aria-hidden="true" />
      </div>

      <section className="home-match-panel home-stadium-panel" aria-label={t.stadium}>
        <div className="home-match-panel-heading"><span><Trophy size={15}/>{t.stadium}</span><b className={`home-stadium-status${selected && isLive(selected) ? ' live' : ''}`}>{selected ? statusText : t.live}</b></div>
        {selected ? <>
          <div className="home-stadium-teams"><span>{home}</span><strong>{homeScore ?? '–'}<i>:</i>{awayScore ?? '–'}</strong><span>{away}</span></div>
          {sport === 'football' ? <svg className="sports-pitch home-stadium-pitch" viewBox="0 0 800 360" role="img" aria-label={`${home} ${homeScore ?? '–'} — ${awayScore ?? '–'} ${away}`}><rect x="1" y="1" width="798" height="358" rx="16"/><rect x="24" y="24" width="752" height="312"/><line x1="400" y1="24" x2="400" y2="336"/><circle cx="400" cy="180" r="61"/><circle className="sports-pitch-mark" cx="400" cy="180" r="4"/><rect x="24" y="104" width="93" height="152"/><rect x="683" y="104" width="93" height="152"/><rect x="24" y="139" width="34" height="82"/><rect x="742" y="139" width="34" height="82"/><path d="M117 137a48 48 0 0 1 0 86M683 137a48 48 0 0 0 0 86"/></svg>
            : <svg className="sports-pitch sports-basketball-court home-stadium-pitch" viewBox="0 0 800 360" role="img" aria-label={`${home} ${homeScore ?? '–'} — ${awayScore ?? '–'} ${away}`}><rect x="1" y="1" width="798" height="358" rx="16"/><rect x="24" y="24" width="752" height="312"/><line x1="400" y1="24" x2="400" y2="336"/><circle cx="400" cy="180" r="61"/><rect x="24" y="90" width="150" height="180"/><rect x="626" y="90" width="150" height="180"/><path d="M174 105a75 75 0 0 1 0 150M626 105a75 75 0 0 0 0 150"/><circle cx="62" cy="180" r="8"/><circle cx="738" cy="180" r="8"/></svg>}
          <div className="home-stadium-events" aria-live="polite">
            {events.length ? events.slice(-3).reverse().map((event, index) => <div key={`${event.minute}-${event.type}-${index}`}><time>{event.minute === null ? '—' : `${event.minute}′`}</time><span>{[event.player, event.detail || event.type, event.team].filter(Boolean).join(' · ')}</span></div>) : <small>{t.noEvents}</small>}
          </div>
        </> : <p className="home-match-empty">{t.noMatches}</p>}
        <a className="home-match-source" href="https://sportscore.com/" target="_blank" rel="dofollow">{t.source}</a>
      </section>
    </div>
  </div>;
}

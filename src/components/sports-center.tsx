'use client';

import { useCallback, useEffect, useState } from 'react';
import { CircleDot, RefreshCw, Radio, Trophy, Goal } from 'lucide-react';
import { useLanguage, type Language } from './language-provider';

type Sport = 'football' | 'basketball';
type Team = { name?: string | null; logo?: string | null };
type MatchStatus = { long?: string; short?: string; elapsed?: number | null; timer?: string | null };
type Match = {
  fixture?: { id?: number; date?: string; status?: MatchStatus; venue?: { name?: string | null; city?: string | null } };
  game?: { id?: number; date?: string; status?: MatchStatus };
  league?: { name?: string; country?: string; round?: string };
  teams?: { home?: Team; away?: Team };
  goals?: { home?: number | null; away?: number | null; halftime?: { home?: number | null; away?: number | null } };
  scores?: { home?: { total?: number | null }; away?: { total?: number | null } };
  sportScore?: { slug?: string; status?: string; statusText?: string; url?: string | null };
};
type Result = { configured?: boolean; matches?: Match[]; message?: string; errorCode?: string; updatedAt?: string; refreshSeconds?: number; source?: string };
type MatchEvent = { minute: number | null; extraMinute: number | null; team: string | null; player: string | null; assist: string | null; type: string | null; detail: string | null; comments: string | null };
type MatchStat = { label: string; home?: number | string | null; away?: number | string | null; home_pct?: number | null; away_pct?: number | null; suffix?: string };
type EventsResult = { configured?: boolean; events?: MatchEvent[]; stats?: MatchStat[]; lineups?: unknown; unavailable?: boolean; updatedAt?: string };
type MatchTab = 'overview' | 'events' | 'statistics' | 'lineups' | 'info';

function matchId(match: Match) {
  return String(match.sportScore?.slug ?? match.fixture?.id ?? match.game?.id ?? '');
}

function isLive(match: Match) {
  return match.sportScore?.status === 'live' || ['1h', '2h', 'ht', 'q1', 'q2', 'q3', 'q4', 'ot', 'et'].includes((match.fixture?.status?.short ?? match.game?.status?.short ?? '').toLowerCase());
}

const copy: Record<Language, Record<string, string>> = {
  tr: { title: 'Canlı Maç Merkezi', lead: 'Gerçek karşılaşmaları ve kaynağın sağladığı maç olaylarını takip et.', football: 'Futbol', basketball: 'Basketbol', live: 'CANLI', refresh: 'Güncelle', updated: 'Son veri', empty: 'Şu anda sağlayıcıdan canlı maç verisi gelmiyor.', setup: 'Canlı veri bağlantısı hazır değil.', setupHint: 'SportScore açık API bağlantısı kullanılır; API anahtarı gerekmez.', source: 'Veri kaynağı: SportScore', interval: 'Maç verisi yaklaşık 1 dakikada bir yenilenir.', noLive: 'Şu an canlı karşılaşma bulunamadı.', error: 'Maç verisi alınamadı. Biraz sonra tekrar dene.', timeline: 'Yazılı akış yalnızca sağlayıcının bildirdiği gerçek olayları listeler. Top koordinatı verisi gelmediğinden 2D sahada top hareketi canlandırılmaz.', selectMatch: 'Canlı maçı seç', selectHint: 'Maç seçilince sağlayıcının olay akışı yüklenir.', commentary: 'Maç olayları', noEvents: 'Seçilen maç için şu anda olay verisi yok.', eventUnavailable: 'Maç olay akışına erişilemiyor.', ballNotAvailable: 'Canlı top koordinat verisi bu kaynakta yok.', stadiumLabel: '2D saha görünümü', basketballTextUnavailable: 'Bu basketbol kaynağı skor ve periyot bilgisini veriyor; yazılı pozisyon akışı sağlamıyor.', goal: 'Gol', card: 'Kart', substitution: 'Oyuncu değişikliği', var: 'VAR', other: 'Maç olayı', halfTime: 'Devre arası', quarter: 'Çeyrek' },
  en: { title: 'Live Match Center', lead: 'Follow real matches and match events provided by the data source.', football: 'Football', basketball: 'Basketball', live: 'LIVE', refresh: 'Refresh', updated: 'Last update', empty: 'The provider has no live match data right now.', setup: 'Live data is not connected yet.', setupHint: 'SportScore uses an open API connection; no API key is required.', source: 'Data source: SportScore', interval: 'Match data refreshes about once a minute.', noLive: 'No live games at the moment.', error: 'Could not load match data. Try again shortly.', timeline: 'The written feed lists only real events returned by the provider. No live ball coordinates are available, so the 2D pitch does not animate ball movement.', selectMatch: 'Select a live match', selectHint: 'The provider event feed loads after you select a match.', commentary: 'Match events', noEvents: 'No events are available for this match right now.', eventUnavailable: 'The match event feed could not be reached.', ballNotAvailable: 'This source does not provide live ball coordinates.', stadiumLabel: '2D pitch view', basketballTextUnavailable: 'This basketball source provides scores and periods, but not a textual play-by-play feed.', goal: 'Goal', card: 'Card', substitution: 'Substitution', var: 'VAR', other: 'Match event', halfTime: 'Half time', quarter: 'Quarter' },
  de: { title: 'Live-Spielzentrum', lead: 'Echte Spiele und gemeldete Ereignisse verfolgen.', football: 'Fußball', basketball: 'Basketball', live: 'LIVE', refresh: 'Aktualisieren', updated: 'Letztes Update', empty: 'Der Anbieter meldet derzeit keine Live-Spiele.', setup: 'Live-Daten sind noch nicht verbunden.', setupHint: 'SportScore verwendet eine offene API-Verbindung; ein API-Schlüssel ist nicht erforderlich.', source: 'Datenquelle: SportScore', interval: 'Spieldaten werden etwa einmal pro Minute aktualisiert.', noLive: 'Derzeit keine Live-Spiele.', error: 'Spieldaten konnten nicht geladen werden.', timeline: 'Der Textfeed zeigt nur echte gemeldete Ereignisse. Live-Ballkoordinaten fehlen; daher wird die Ballbewegung nicht animiert.', selectMatch: 'Live-Spiel auswählen', selectHint: 'Der Ereignisfeed lädt nach der Spielauswahl.', commentary: 'Spielereignisse', noEvents: 'Für dieses Spiel liegen derzeit keine Ereignisse vor.', eventUnavailable: 'Der Ereignisfeed ist nicht erreichbar.', ballNotAvailable: 'Diese Quelle liefert keine Live-Ballkoordinaten.', stadiumLabel: '2D-Spielfeld', goal: 'Tor', card: 'Karte', substitution: 'Auswechslung', var: 'VAR', other: 'Spielereignis', halfTime: 'Halbzeit', quarter: 'Viertel' },
  es: { title: 'Centro de partidos en directo', lead: 'Sigue partidos reales y los eventos que proporciona la fuente.', football: 'Fútbol', basketball: 'Baloncesto', live: 'EN VIVO', refresh: 'Actualizar', updated: 'Última actualización', empty: 'La fuente no ofrece partidos en directo ahora.', setup: 'Los datos en directo aún no están conectados.', setupHint: 'SportScore utiliza una API abierta; no se necesita una clave.', source: 'Fuente de datos: SportScore', interval: 'Los datos se actualizan aproximadamente una vez por minuto.', noLive: 'No hay partidos en directo ahora.', error: 'No se pudieron cargar los datos.', timeline: 'El texto muestra únicamente eventos reales de la fuente. No hay coordenadas de balón en directo y no se anima su movimiento.', selectMatch: 'Seleccionar partido en directo', selectHint: 'El flujo de eventos se carga al elegir un partido.', commentary: 'Eventos del partido', noEvents: 'No hay eventos disponibles ahora.', eventUnavailable: 'No se pudo acceder al flujo de eventos.', ballNotAvailable: 'La fuente no proporciona coordenadas del balón.', stadiumLabel: 'Vista del campo 2D', goal: 'Gol', card: 'Tarjeta', substitution: 'Sustitución', var: 'VAR', other: 'Evento del partido', halfTime: 'Descanso', quarter: 'Cuarto' },
  ru: { title: 'Центр матчей в прямом эфире', lead: 'Следите за реальными матчами и событиями из источника.', football: 'Футбол', basketball: 'Баскетбол', live: 'В ЭФИРЕ', refresh: 'Обновить', updated: 'Обновлено', empty: 'Сейчас источник не передаёт данные о матчах.', setup: 'Прямые данные пока не подключены.', setupHint: 'SportScore использует открытый API; ключ не требуется.', source: 'Источник данных: SportScore', interval: 'Данные обновляются примерно раз в минуту.', noLive: 'Сейчас нет матчей в прямом эфире.', error: 'Не удалось загрузить данные матчей.', timeline: 'Текстовый поток показывает только реальные события источника. Координат мяча в реальном времени нет, поэтому движение не анимируется.', selectMatch: 'Выберите матч в эфире', selectHint: 'Лента событий загрузится после выбора матча.', commentary: 'События матча', noEvents: 'Сейчас нет событий по этому матчу.', eventUnavailable: 'Не удалось получить ленту событий.', ballNotAvailable: 'Источник не предоставляет координаты мяча.', stadiumLabel: 'Поле 2D', goal: 'Гол', card: 'Карточка', substitution: 'Замена', var: 'VAR', other: 'Событие матча', halfTime: 'Перерыв', quarter: 'Четверть' },
  fr: { title: 'Centre des matchs en direct', lead: 'Suivez les matchs et les événements réels de la source.', football: 'Football', basketball: 'Basket', live: 'EN DIRECT', refresh: 'Actualiser', updated: 'Dernière mise à jour', empty: 'Aucune donnée de match en direct pour le moment.', setup: 'Les données en direct ne sont pas encore connectées.', setupHint: 'SportScore utilise une API ouverte ; aucune clé n’est nécessaire.', source: 'Source des données : SportScore', interval: 'Les données sont actualisées environ une fois par minute.', noLive: 'Aucun match en direct pour le moment.', error: 'Impossible de charger les données.', timeline: 'Le fil écrit ne montre que les événements réels de la source. Aucune coordonnée du ballon n’est fournie, donc son mouvement n’est pas animé.', selectMatch: 'Sélectionner un match en direct', selectHint: 'Le fil d’événements se charge après la sélection.', commentary: 'Événements du match', noEvents: 'Aucun événement disponible actuellement.', eventUnavailable: 'Le fil d’événements est inaccessible.', ballNotAvailable: 'La source ne fournit pas les coordonnées du ballon.', stadiumLabel: 'Terrain 2D', goal: 'But', card: 'Carton', substitution: 'Remplacement', var: 'VAR', other: 'Événement', halfTime: 'Mi-temps', quarter: 'Quart-temps' },
  ar: { title: 'مركز المباريات المباشرة', lead: 'تابع المباريات الحقيقية والأحداث التي يوفرها المصدر.', football: 'كرة القدم', basketball: 'كرة السلة', live: 'مباشر', refresh: 'تحديث', updated: 'آخر تحديث', empty: 'لا توجد بيانات مباريات مباشرة من المصدر الآن.', setup: 'لم يتم ربط البيانات المباشرة بعد.', setupHint: 'يستخدم SportScore واجهة مفتوحة ولا يحتاج إلى مفتاح API.', source: 'مصدر البيانات: SportScore', interval: 'يتم تحديث البيانات مرة واحدة تقريباً كل دقيقة.', noLive: 'لا توجد مباريات مباشرة الآن.', error: 'تعذر تحميل بيانات المباراة.', timeline: 'يعرض النص أحداث المصدر الحقيقية فقط. لا تتوفر إحداثيات الكرة المباشرة، لذلك لن تُحرك الكرة بشكل مصطنع.', selectMatch: 'اختر مباراة مباشرة', selectHint: 'يتم تحميل سجل الأحداث بعد اختيار المباراة.', commentary: 'أحداث المباراة', noEvents: 'لا توجد أحداث متاحة لهذه المباراة الآن.', eventUnavailable: 'تعذر الوصول إلى سجل أحداث المباراة.', ballNotAvailable: 'المصدر لا يوفر إحداثيات الكرة المباشرة.', stadiumLabel: 'ملعب ثنائي الأبعاد', goal: 'هدف', card: 'بطاقة', substitution: 'تبديل', var: 'حكم الفيديو', other: 'حدث المباراة', halfTime: 'استراحة', quarter: 'ربع' },
  zh: { title: '赛事直播中心', lead: '关注真实比赛及数据源提供的赛事事件。', football: '足球', basketball: '篮球', live: '直播', refresh: '刷新', updated: '最近更新', empty: '数据源目前没有正在进行的比赛。', setup: '实时数据尚未接入。', setupHint: 'SportScore 使用开放 API，无需 API 密钥。', source: '数据来源：SportScore', interval: '比赛数据约每分钟更新一次。', noLive: '目前没有直播比赛。', error: '暂时无法加载比赛数据。', timeline: '文字动态只显示来源中的真实事件。来源没有实时球坐标，因此不会虚构球的移动。', selectMatch: '选择一场直播比赛', selectHint: '选择比赛后加载来源事件。', commentary: '比赛事件', noEvents: '目前没有此比赛的事件数据。', eventUnavailable: '无法获取比赛事件。', ballNotAvailable: '此来源不提供实时球坐标。', stadiumLabel: '二维球场', goal: '进球', card: '牌', substitution: '换人', var: '视频助理裁判', other: '比赛事件', halfTime: '中场', quarter: '节' },
};

const matchDetailCopy: Record<Language, Record<string, string>> = {
  tr: { overview: 'Maç', eventsTab: 'Maç akışı', statistics: 'İstatistik', lineups: 'Kadro', info: 'Maç bilgisi', firstHalf: 'İlk yarı', kickoff: 'Tarih ve saat', venue: 'Stadyum', round: 'Tur', noStats: 'Bu maç için doğrulanmış istatistik verisi bağlı değil.', noLineups: 'Bu maç için doğrulanmış kadro verisi bağlı değil.', eventSource: 'Kaynağın bildirdiği olaylar', selectSport: 'Spor dalı' },
  en: { overview: 'Match', eventsTab: 'Match feed', statistics: 'Statistics', lineups: 'Lineups', info: 'Match info', firstHalf: 'Half time', kickoff: 'Date and time', venue: 'Stadium', round: 'Round', noStats: 'Verified statistics are not connected for this match.', noLineups: 'Verified lineup data is not connected for this match.', eventSource: 'Events reported by the provider', selectSport: 'Sport' },
  de: { overview: 'Spiel', eventsTab: 'Spielverlauf', statistics: 'Statistik', lineups: 'Aufstellung', info: 'Spielinfo', firstHalf: 'Halbzeit', kickoff: 'Datum und Uhrzeit', venue: 'Stadion', round: 'Runde', noStats: 'Für dieses Spiel sind keine bestätigten Statistiken verbunden.', noLineups: 'Für dieses Spiel sind keine bestätigten Aufstellungen verbunden.', eventSource: 'Vom Anbieter gemeldete Ereignisse', selectSport: 'Sportart' },
  es: { overview: 'Partido', eventsTab: 'Eventos', statistics: 'Estadísticas', lineups: 'Alineaciones', info: 'Información', firstHalf: 'Descanso', kickoff: 'Fecha y hora', venue: 'Estadio', round: 'Jornada', noStats: 'No hay estadísticas verificadas conectadas para este partido.', noLineups: 'No hay alineaciones verificadas conectadas para este partido.', eventSource: 'Eventos comunicados por la fuente', selectSport: 'Deporte' },
  ru: { overview: 'Матч', eventsTab: 'События', statistics: 'Статистика', lineups: 'Составы', info: 'Информация', firstHalf: 'Первый тайм', kickoff: 'Дата и время', venue: 'Стадион', round: 'Тур', noStats: 'Подтверждённая статистика матча не подключена.', noLineups: 'Подтверждённые составы матча не подключены.', eventSource: 'События от поставщика данных', selectSport: 'Вид спорта' },
  fr: { overview: 'Match', eventsTab: 'Fil du match', statistics: 'Statistiques', lineups: 'Compositions', info: 'Infos du match', firstHalf: 'Mi-temps', kickoff: 'Date et heure', venue: 'Stade', round: 'Journée', noStats: 'Aucune statistique vérifiée n’est connectée pour ce match.', noLineups: 'Aucune composition vérifiée n’est connectée pour ce match.', eventSource: 'Événements signalés par la source', selectSport: 'Sport' },
  ar: { overview: 'المباراة', eventsTab: 'الأحداث', statistics: 'الإحصاءات', lineups: 'التشكيلة', info: 'معلومات المباراة', firstHalf: 'الشوط الأول', kickoff: 'التاريخ والوقت', venue: 'الملعب', round: 'الجولة', noStats: 'إحصاءات موثقة لهذه المباراة غير متصلة.', noLineups: 'تشكيلة موثقة لهذه المباراة غير متصلة.', eventSource: 'الأحداث التي أبلغ عنها المصدر', selectSport: 'الرياضة' },
  zh: { overview: '比赛', eventsTab: '比赛动态', statistics: '统计', lineups: '阵容', info: '比赛信息', firstHalf: '半场', kickoff: '日期和时间', venue: '球场', round: '轮次', noStats: '此比赛尚未接入经核实的统计数据。', noLineups: '此比赛尚未接入经核实的阵容数据。', eventSource: '数据源提供的比赛事件', selectSport: '运动' },
};

export function SportsCenter({ embedded = false }: { embedded?: boolean }) {
  const { language } = useLanguage();
  const t = copy[language];
  const detailText = matchDetailCopy[language];
  const [sport, setSport] = useState<Sport>('football');
  const [data, setData] = useState<Record<Sport, Result | null>>({ football: null, basketball: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [eventsResult, setEventsResult] = useState<EventsResult | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [matchTab, setMatchTab] = useState<MatchTab>('overview');

  const load = useCallback(async (selected: Sport) => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/sports/matches?sport=${selected}`, { cache: 'no-store' });
      const result = await response.json() as Result;
      setData((current) => ({ ...current, [selected]: result }));
      if (!response.ok) throw new Error('match data unavailable');
      setSelectedMatchId((current) => current && result.matches?.some((match) => matchId(match) === current) ? current : matchId(result.matches?.[0] ?? {}));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(sport), 0);
    return () => window.clearTimeout(timer);
  }, [sport, load]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(sport);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [sport, load]);

  const result = data[sport];
  const matches = result?.matches ?? [];
  const selectedMatch = matches.find((match) => matchId(match) === selectedMatchId);

  const loadEvents = useCallback(async (fixtureId: string) => {
    if (!fixtureId) {
      setEventsResult(null);
      return;
    }
    setLoadingEvents(true);
    try {
      const response = await fetch(`/api/sports/events?sport=${sport}&id=${encodeURIComponent(fixtureId)}`, { cache: 'no-store' });
      const payload = await response.json() as EventsResult;
      setEventsResult(response.ok ? payload : { configured: true, events: [], unavailable: true });
    } catch {
      setEventsResult({ configured: true, events: [], unavailable: true });
    } finally {
      setLoadingEvents(false);
    }
  }, [sport]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvents(selectedMatchId), 0);
    return () => window.clearTimeout(timer);
  }, [selectedMatchId, loadEvents]);

  useEffect(() => {
    if (!selectedMatchId) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadEvents(selectedMatchId);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [selectedMatchId, loadEvents]);

  const eventName = (event: MatchEvent) => {
    if (event.type === 'Goal') return `${t.goal}${event.detail ? ` · ${event.detail}` : ''}`;
    if (event.type === 'Card') return `${t.card}${event.detail ? ` · ${event.detail}` : ''}`;
    if (event.type === 'subst') return t.substitution;
    if (event.type === 'Var') return `${t.var}${event.detail ? ` · ${event.detail}` : ''}`;
    return event.detail || event.comments || event.type || t.other;
  };

  const selectedStatus = selectedMatch?.fixture?.status ?? selectedMatch?.game?.status;
  const home = selectedMatch?.teams?.home?.name ?? '—';
  const away = selectedMatch?.teams?.away?.name ?? '—';
  const homeScore = selectedMatch ? (sport === 'football' ? selectedMatch.goals?.home : selectedMatch.scores?.home?.total) : null;
  const awayScore = selectedMatch ? (sport === 'football' ? selectedMatch.goals?.away : selectedMatch.scores?.away?.total) : null;

  return <section className={`sports-page${embedded ? ' sports-page-home' : ''}`} lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <div className="sports-shell">
      <header className="sports-heading">
        <p className="sports-kicker"><Radio size={15} /> XUCUZ SPORTS</p>
        <h1>{t.title}</h1>
        <p>{t.lead}</p>
      </header>

      <div className="sports-toolbar">
        <div className="sports-tabs" role="tablist" aria-label="Sport">
          {(['football', 'basketball'] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={sport === item} className={sport === item ? 'active' : ''} onClick={() => { setSport(item); setSelectedMatchId(''); setEventsResult(null); setMatchTab('overview'); }}><Trophy size={16} />{t[item]}</button>)}
        </div>
        <button type="button" className="sports-refresh" onClick={() => void load(sport)} disabled={loading}><RefreshCw size={15} className={loading ? 'spinning' : ''} />{t.refresh}</button>
      </div>

      <p className="sports-source"><CircleDot size={12} /> {t.source} · {t.interval} · <a href="https://sportscore.com/" target="_blank" rel="dofollow">SportScore</a></p>

      {!result?.configured ? <div className="sports-empty"><span className="sports-empty-icon"><Radio size={22} /></span><h2>{t.setup}</h2><p>{t.setupHint}</p></div>
        : error ? <div className="sports-empty" role="status"><h2>{t.error}</h2><button type="button" className="sports-inline-button" onClick={() => void load(sport)}>{t.refresh}</button></div>
        : !matches.length ? <div className="sports-empty" role="status"><h2>{t.noLive}</h2><p>{t.empty}</p></div>
        : <>
          <label className="sports-match-select-label">{t.selectMatch}
            <select value={selectedMatchId} onChange={(event) => { setSelectedMatchId(event.target.value); setEventsResult(null); setMatchTab('overview'); }}>
          {matches.map((match) => <option key={matchId(match)} value={matchId(match)}>{match.sportScore?.statusText ? `${match.sportScore.statusText} · ` : ''}{match.league?.name ? `${match.league.name} · ` : ''}{match.teams?.home?.name ?? '—'} — {match.teams?.away?.name ?? '—'}</option>)}
            </select>
          </label>
          {selectedMatch && <article className="sports-match-card sports-selected-match">
            <div className="sports-match-meta"><span>{[selectedMatch.league?.name, selectedMatch.league?.country, selectedMatch.league?.round].filter(Boolean).join(' · ')}</span><b className={isLive(selectedMatch) ? 'is-live' : 'is-not-live'}>{isLive(selectedMatch) && <i />}{isLive(selectedMatch) ? t.live : selectedMatch.sportScore?.statusText ?? selectedStatus?.long ?? selectedStatus?.short ?? '—'} {selectedStatus?.elapsed ? `· ${selectedStatus.elapsed}′` : selectedStatus?.timer ? `· ${selectedStatus.timer}` : ''}</b></div>
            <div className="sports-match-score"><strong><span className="sports-team-mark">{home.slice(0, 1)}</span>{home}</strong><span>{homeScore ?? '–'} <small>:</small> {awayScore ?? '–'}</span><strong><span className="sports-team-mark">{away.slice(0, 1)}</span>{away}</strong></div>
            {selectedMatch.goals?.halftime && <small>{detailText.firstHalf}: {selectedMatch.goals.halftime.home ?? '–'} : {selectedMatch.goals.halftime.away ?? '–'}</small>}
            <small>{selectedStatus?.long ?? selectedStatus?.short ?? ''}</small>
          </article>}
        </>}

      {selectedMatch && <>
        <div className="sports-match-tabs" role="tablist" aria-label="Match details">
          {(['overview', 'events', 'statistics', 'lineups', 'info'] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={matchTab === tab} className={matchTab === tab ? 'active' : ''} onClick={() => setMatchTab(tab)}>{tab === 'events' ? detailText.eventsTab : detailText[tab]}</button>)}
        </div>
        {matchTab === 'overview' && <div className="sports-stadium-panel">
          <div className="sports-stadium-heading"><Goal size={17}/><strong>{t.stadiumLabel}</strong></div>
          <div className="sports-stadium-scoreboard"><span>{home}</span><strong>{homeScore ?? '–'} : {awayScore ?? '–'}</strong><span>{away}</span><small>{isLive(selectedMatch) ? t.live : selectedMatch.sportScore?.statusText ?? selectedStatus?.long ?? ''}</small></div>
          {sport === 'football' ? <svg className="sports-pitch" viewBox="0 0 800 360" role="img" aria-label={t.ballNotAvailable}><rect x="1" y="1" width="798" height="358" rx="16"/><rect x="24" y="24" width="752" height="312"/><line x1="400" y1="24" x2="400" y2="336"/><circle cx="400" cy="180" r="61"/><circle className="sports-pitch-mark" cx="400" cy="180" r="4"/><rect x="24" y="104" width="93" height="152"/><rect x="683" y="104" width="93" height="152"/><rect x="24" y="139" width="34" height="82"/><rect x="742" y="139" width="34" height="82"/><path d="M117 137a48 48 0 0 1 0 86M683 137a48 48 0 0 0 0 86"/></svg>
            : <svg className="sports-pitch sports-basketball-court" viewBox="0 0 800 360" role="img" aria-label={t.ballNotAvailable}><rect x="1" y="1" width="798" height="358" rx="16"/><rect x="24" y="24" width="752" height="312"/><line x1="400" y1="24" x2="400" y2="336"/><circle cx="400" cy="180" r="61"/><rect x="24" y="90" width="150" height="180"/><rect x="626" y="90" width="150" height="180"/><path d="M174 105a75 75 0 0 1 0 150M626 105a75 75 0 0 0 0 150"/><circle cx="62" cy="180" r="8"/><circle cx="738" cy="180" r="8"/></svg>}
          <p>{t.ballNotAvailable}</p>
        </div>}
        {matchTab === 'events' && <section className="sports-commentary" aria-live="polite">
          <div className="sports-commentary-heading"><h2>{t.commentary}</h2><button type="button" onClick={() => void loadEvents(selectedMatchId)} disabled={loadingEvents || !selectedMatchId}>{t.refresh}</button></div>
          <p className="sports-feed-source">{detailText.eventSource}</p>
          {loadingEvents ? <p role="status">{t.selectHint}</p>
              : eventsResult?.unavailable ? <p role="status">{t.eventUnavailable}</p>
                : !eventsResult?.events?.length ? <p role="status">{t.noEvents}</p>
                  : <ol>{eventsResult.events.slice().reverse().map((event, index) => <li key={`${event.minute}-${event.type}-${index}`}><time>{event.minute === null ? '—' : `${event.minute}${event.extraMinute ? `+${event.extraMinute}` : ''}′`}</time><div><strong>{eventName(event)}</strong><span>{[event.player, event.assist ? `→ ${event.assist}` : null, event.team].filter(Boolean).join(' · ')}</span></div></li>)}</ol>}
        </section>}
        {matchTab === 'statistics' && <section className="sports-detail-empty"><h2>{detailText.statistics}</h2>{eventsResult?.stats?.length ? <dl className="sports-stat-list">{eventsResult.stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.home ?? '—'}{stat.suffix ?? ''}<span>{stat.away ?? '—'}{stat.suffix ?? ''}</span></dd></div>)}</dl> : <p>{detailText.noStats}</p>}</section>}
        {matchTab === 'lineups' && <section className="sports-detail-empty"><h2>{detailText.lineups}</h2><p>{detailText.noLineups}</p></section>}
        {matchTab === 'info' && <section className="sports-match-info">
          <h2>{detailText.info}</h2>
          <dl>
            <div><dt>{detailText.kickoff}</dt><dd>{(selectedMatch.fixture?.date ?? selectedMatch.game?.date) ? new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : language, { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date((selectedMatch.fixture?.date ?? selectedMatch.game?.date)!)) : '—'}</dd></div>
            <div><dt>{t.source}</dt><dd>{selectedMatch.league?.name ?? '—'}{selectedMatch.league?.country ? ` · ${selectedMatch.league.country}` : ''}</dd></div>
            <div><dt>{detailText.round}</dt><dd>{selectedMatch.league?.round ?? '—'}</dd></div>
            <div><dt>{detailText.venue}</dt><dd>{selectedMatch.fixture?.venue?.name ?? '—'}{selectedMatch.fixture?.venue?.city ? ` · ${selectedMatch.fixture.venue.city}` : ''}</dd></div>
          </dl>
        </section>}
      </>}

      {result?.updatedAt && <p className="sports-updated">{t.updated}: {new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : language, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date(result.updatedAt))}</p>}
      <aside className="sports-disclaimer">{t.timeline}</aside>
    </div>
  </section>;
}

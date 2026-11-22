"use client";

import { useEffect, useState } from "react";

type Match = { competition: string; slug: string; home: string; away: string; home_score: number | null; away_score: number | null; status: string; status_text: string; time: string | null };

export default function LiveFootballPage() {
  const [seconds, setSeconds] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Match | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailError, setDetailError] = useState("");
  async function selectMatch(match: Match) {
    setSelected(match); setDetail(null); setDetailError("");
    if (!match.slug) { setDetailError("Bu maçın ayrıntı bağlantısı bulunmuyor."); return; }
    try {
      const r = await fetch("/api/live-football/detail?slug=" + encodeURIComponent(match.slug));
      if (!r.ok) throw new Error("Unavailable");
      const payload = await r.json();
      setDetail(payload.data ?? null);
    } catch { setDetailError("Maç ayrıntıları şu anda alınamıyor."); }
  }
  const [liveOnly, setLiveOnly] = useState(false);
  const filteredMatches = matches.filter(m => (!liveOnly || ["live", "inprogress", "in_progress", "1h", "2h", "ht"].includes(m.status.toLowerCase())) && [m.home, m.away, m.competition].some(v => v.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))));
  const [loadError, setLoadError] = useState("");
  const [updated, setUpdated] = useState("");
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/api/live-football", { cache: "no-store" });
        if (!response.ok) throw new Error("Veri alınamadı");
        const data = await response.json();
        if (active) { setMatches(data.matches ?? []); setUpdated(data.updated ?? ""); setLoadError(""); }
      } catch { if (active) setLoadError("Canlı veri geçici olarak alınamıyor."); }
    }
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return () => window.clearInterval(id);
  }, [playing]);
  const minute = Math.floor(seconds / 60);
  const current = events.filter((e) => e.minute <= minute);
  const home = current.reduce((n, e) => e.home ?? n, 0);
  const away = current.reduce((n, e) => e.away ?? n, 0);
  const ballX = 12 + ((seconds * 0.13) % 76);
  const ballY = 50 + Math.sin(seconds / 55) * 27;
  function announce(message: string) {
    if (!speech || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "tr-TR";
    window.speechSynthesis.speak(utterance);
  }
  useEffect(() => {
    const event = events.find((e) => e.minute === minute);
    if (event && seconds % 60 === 0) announce(event.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, speech]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-slate-900">
      <h1 className="text-3xl font-bold">⚽ Xucuz Canlı Futbol</h1>
      <section className="mt-5 rounded-xl border bg-white p-4"><h2 className="text-xl font-bold">Gerçek futbol skorları — SportScore</h2><p className="text-sm text-slate-600">Veriler yaklaşık 60 saniyede yenilenir. Yalnızca sağlayıcının sunduğu maçlar gösterilir.</p>{loadError && <p role="alert" className="mt-2 text-red-700">{loadError}</p>}{updated && <p className="mt-1 text-xs text-slate-500">Son sorgu: {new Date(updated).toLocaleTimeString("tr-TR")}</p>}<div className="mt-3 flex flex-wrap gap-3"><input aria-label="Takım veya lig ara" placeholder="Takım veya lig ara" className="min-w-0 flex-1 rounded-lg border p-2" value={query} onChange={e => setQuery(e.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={liveOnly} onChange={e => setLiveOnly(e.target.checked)} /> Yalnızca canlı</label></div><div className="mt-3 grid gap-2">{filteredMatches.length ? filteredMatches.map((m, i) => <button type="button" onClick={() => selectMatch(m)} key={m.slug || i} className="flex w-full items-center justify-between gap-3 rounded-lg bg-slate-100 p-3 text-left hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700"><span className="min-w-0 flex-1"><span className="block text-xs text-slate-500">{m.competition}</span>{m.home} – {m.away}</span><strong className="whitespace-nowrap">{m.home_score ?? "-"} : {m.away_score ?? "-"}</strong><span className="w-24 text-right text-xs">{m.status_text || m.status}</span></button>) : <p className="text-sm text-slate-600">Şu anda listelenecek maç bulunamadı.</p>}</div>{selected && <div className="mt-4 rounded-lg border border-emerald-300 p-4"><h3 className="font-bold">{selected.home} – {selected.away}</h3><p className="text-sm">Durum: {selected.status_text || selected.status}</p>{detailError && <p role="alert" className="text-sm text-red-700">{detailError}</p>}{!detail && !detailError && <p className="text-sm">Maç ayrıntıları yükleniyor…</p>}{detail && <><p className="mt-2 text-sm">Sağlayıcıdan gerçek maç ayrıntıları alındı.</p>{Array.isArray(detail.timeline) && detail.timeline.length > 0 ? <ul className="mt-2 list-inside list-disc text-sm">{detail.timeline.slice(0, 30).map((e, i) => <li key={i}>{typeof e === "string" ? e : typeof e === "object" && e && "text" in e ? String(e.text) : "Maç olayı"}</li>)}</ul> : <p className="mt-2 text-sm text-slate-600">Bu karşılaşma için olay akışı mevcut değil.</p>}</>}</div>}<p className="mt-3 text-xs">Powered by <a href="https://sportscore.com/" className="underline">SportScore</a></p></section><p className="mt-5 text-sm text-slate-600">Skorlar doğrudan SportScore sağlayıcısından gelir. Sağlayıcı henüz skor bildirmediyse — gösterilir; tahmini skor üretilmez.</p>\n    </main>
  );
}

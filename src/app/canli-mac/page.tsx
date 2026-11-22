"use client";

import { useEffect, useState } from "react";

type Match = { slug: string; home: string; away: string; home_score: number | null; away_score: number | null; status: string; status_text: string; time: string | null };

const events = [
  { minute: 12, label: "Ev sahibi takım atağa çıkıyor." },
  { minute: 24, label: "Sarı kart! Hakem oyunu durdurdu." },
  { minute: 38, label: "GOL! Ev sahibi takım öne geçti.", home: 1 },
  { minute: 61, label: "Deplasman takımından beraberlik golü!", away: 1 },
  { minute: 77, label: "GOL! Ev sahibi yeniden önde.", home: 2 },
];
export default function LiveFootballPage() {
  const [seconds, setSeconds] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
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
  const [playing, setPlaying] = useState(false);
  const [speech, setSpeech] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setSeconds((s) => Math.min(90 * 60, s + 15)), 250);
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
      <section className="mt-5 rounded-xl border bg-white p-4"><h2 className="text-xl font-bold">Gerçek maç skorları — SportScore</h2><p className="text-sm text-slate-600">Veriler yaklaşık 60 saniyede yenilenir. Yalnızca sağlayıcının sunduğu maçlar gösterilir.</p>{loadError && <p role="alert" className="mt-2 text-red-700">{loadError}</p>}{updated && <p className="mt-1 text-xs text-slate-500">Son sorgu: {new Date(updated).toLocaleTimeString("tr-TR")}</p>}<div className="mt-3 grid gap-2">{matches.length ? matches.map((m, i) => <div key={m.slug || i} className="flex items-center justify-between gap-3 rounded-lg bg-slate-100 p-3"><span className="min-w-0 flex-1">{m.home} – {m.away}</span><strong className="whitespace-nowrap">{m.home_score ?? "-"} : {m.away_score ?? "-"}</strong><span className="w-24 text-right text-xs">{m.status_text || m.status}</span></div>) : <p className="text-sm text-slate-600">Şu anda listelenecek maç bulunamadı.</p>}</div><p className="mt-3 text-xs">Powered by <a href="https://sportscore.com/" className="underline">SportScore</a></p></section><p className="mt-5 text-sm text-amber-800">Aşağıdaki saha DEMO simülasyonudur; üstteki gerçek skorlarla bağlantılı değildir.</p>
      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-center">
          <span className="font-semibold">Ev Sahibi</span>
          <div><div className="text-4xl font-black">{home} - {away}</div><div className="text-sm">{String(minute).padStart(2, "0")}:00 / 90:00</div></div>
          <span className="font-semibold">Deplasman</span>
        </div>
        <div className="relative mt-6 aspect-[1.8] overflow-hidden rounded-lg border-4 border-white bg-emerald-700" aria-label="Temsili animasyonlu futbol sahası">
          <div className="absolute inset-3 border-2 border-white/80" />
          <div className="absolute bottom-3 left-1/2 top-3 border-l-2 border-white/80" />
          <div className="absolute left-1/2 top-1/2 aspect-square w-[20%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80" />
          <div className="absolute left-3 top-1/4 h-1/2 w-[15%] border-2 border-white/80" />
          <div className="absolute right-3 top-1/4 h-1/2 w-[15%] border-2 border-white/80" />
          <div className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-900 bg-white shadow" style={{ left: `${ballX}%`, top: `${ballY}%`, transition: "left 250ms linear, top 250ms linear" }} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white" onClick={() => setPlaying(!playing)}>{playing ? "Duraklat" : "Demoyu başlat"}</button>
          <button className="rounded-lg border px-5 py-2" onClick={() => {setPlaying(false);setSeconds(0);window.speechSynthesis?.cancel();}}>Sıfırla</button>
          <button className="rounded-lg border px-5 py-2" onClick={() => setSpeech(!speech)}>Sesli anlatım: {speech ? "Açık" : "Kapalı"}</button>
        </div>
        <h2 className="mt-7 text-xl font-bold">Türkçe maç anlatımı</h2>
        <div aria-live="polite" className="mt-3 space-y-2">
          {current.length ? [...current].reverse().map((e) => <p className="rounded-lg bg-slate-100 p-3" key={e.minute}><strong>{e.minute}&apos;</strong> {e.label}</p>) : <p>Maç başlamak üzere. Demoyu başlatın.</p>}
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-600">Gerçek canlı skorlar ve dünya ligleri, veri kaynağının lisans ve kapsamı doğrulandıktan sonra bağlanacaktır.</p>
    </main>
  );
}

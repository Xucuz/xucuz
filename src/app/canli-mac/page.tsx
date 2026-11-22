"use client";
import { useEffect, useState } from "react";
type Match = { competition:string; slug:string; home:string; away:string; home_score:number|null; away_score:number|null; status:string; status_text:string; time:string|null };
export default function LiveFootballPage() {
 const [matches,setMatches]=useState<Match[]>([]);
 const [query,setQuery]=useState("");
 const [liveOnly,setLiveOnly]=useState(false);
 const [error,setError]=useState("");
 const [updated,setUpdated]=useState("");
 useEffect(()=>{
  let active=true;
  async function refresh(){
   try {
    const r=await fetch("/api/live-football",{cache:"no-store"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    const data=await r.json();
    if(active){setMatches(Array.isArray(data.matches)?data.matches:[]);setUpdated(data.updated||"");setError("");}
   } catch {if(active)setError("Gerçek skor verileri şu anda alınamıyor.");}
  }
  void refresh();
  const timer=window.setInterval(()=>{void refresh();},60000);
  return ()=>{active=false;window.clearInterval(timer);};
 },[]);
 const filtered=matches.filter(m=>(!liveOnly||["live","inprogress","in_progress","1h","2h","ht"].includes(m.status.toLowerCase()))&&[m.home,m.away,m.competition].some(v=>v.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))));
 return <main className="mx-auto max-w-5xl px-4 py-10 text-slate-900">
  <h1 className="text-3xl font-bold">⚽ Xucuz Gerçek Futbol Skorları</h1>
  <p className="mt-2 text-sm text-slate-600">Skorlar ESPN veri kaynağından gelir ve yaklaşık 60 saniyede yenilenir. Tahmini skor gösterilmez.</p>
  {error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}
  {updated&&<p className="mt-2 text-xs text-slate-500">Son sorgu: {new Date(updated).toLocaleTimeString("tr-TR")}</p>}
  <div className="mt-5 flex flex-wrap gap-3">
   <input aria-label="Takım veya lig ara" placeholder="Takım veya lig ara" className="min-w-0 flex-1 rounded-lg border p-2" value={query} onChange={e=>setQuery(e.target.value)}/>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={liveOnly} onChange={e=>setLiveOnly(e.target.checked)}/>Yalnızca canlı</label>
  </div>
  <div className="mt-4 grid gap-2">{filtered.length?filtered.map((m,i)=><div key={m.slug||i} className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
   <span className="min-w-0 flex-1"><span className="block text-xs text-slate-500">{m.competition}</span>{m.home} – {m.away}</span>
   <strong className="whitespace-nowrap">{m.home_score??"–"} : {m.away_score??"–"}</strong>
   <span className="w-24 text-right text-xs">{m.status_text||m.status}</span>
  </div>):<p className="text-sm text-slate-600">Gösterilecek maç bulunamadı.</p>}</div>
  <p className="mt-5 text-xs text-slate-600">Veri kaynağı: <a className="underline" href="https://www.espn.com/soccer/scoreboard">ESPN</a>. Skor bildirilmediğinde – gösterilir.</p>
 </main>;
}

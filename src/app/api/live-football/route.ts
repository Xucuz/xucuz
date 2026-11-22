import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
type Json = Record<string, unknown>;
const leagues = ["tur.1","eng.1","esp.1","ita.1","ger.1","fra.1","uefa.champions","uefa.europa","usa.1","bra.1","arg.1","mex.1","ned.1","por.1","sco.1","bel.1","ksa.1","uefa.conference"];
const obj = (v: unknown): Json => v && typeof v === "object" && !Array.isArray(v) ? v as Json : {};
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const str = (v: unknown): string => typeof v === "string" ? v : "";
const score = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && /^\d+$/.test(v)) ? Number(v) : null;
async function getLeague(league: string) {
 const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/" + encodeURIComponent(league) + "/scoreboard";
 const response = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8500), headers: { Accept: "application/json" } });
 if (!response.ok) throw new Error("ESPN " + league + " " + response.status);
 const data = obj(await response.json());
 const name = str(obj(arr(data.leagues)[0]).name) || league;
 return arr(data.events).map((raw) => {
  const event = obj(raw);
  const competition = obj(arr(event.competitions)[0]);
  const competitors = arr(competition.competitors).map(obj);
  const home = competitors.find(c => c.homeAway === "home");
  const away = competitors.find(c => c.homeAway === "away");
  if (!home || !away) return null;
  const status = obj(event.status);
  const type = obj(status.type);
  const state = str(type.state);
  const statusText = str(type.shortDetail) || str(type.description) || str(status.displayClock);
  return {
   competition: name, slug: str(event.id), home: str(obj(home.team).displayName) || str(obj(home.team).name) || "Ev sahibi",
   away: str(obj(away.team).displayName) || str(obj(away.team).name) || "Deplasman",
   home_score: score(home.score), away_score: score(away.score),
   status: state === "in" ? "live" : state === "post" ? "finished" : "scheduled",
   status_text: statusText, time: str(event.date) || null,
  };
 }).filter((v): v is NonNullable<typeof v> => v !== null);
}
export async function GET() {
 const results = await Promise.allSettled(leagues.map(getLeague));
 const matches = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
 if (!results.some(r => r.status === "fulfilled")) {
  return NextResponse.json({error:"Gerçek skor kaynağına ulaşılamıyor.",matches:[]},{status:503});
 }
 matches.sort((a,b) => (a.status === "live" ? -1 : b.status === "live" ? 1 : 0) || (a.time || "").localeCompare(b.time || ""));
 return NextResponse.json({matches,updated:new Date().toISOString(),provider:"ESPN",leaguesAvailable:results.filter(r=>r.status==="fulfilled").length},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=60"}});
}

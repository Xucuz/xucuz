import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const response = await fetch("https://sportscore.com/api/widget/matches/?sport=football&limit=50", { next: { revalidate: 60 }, signal: AbortSignal.timeout(9000) });
    if (!response.ok) throw new Error("SportScore " + response.status);
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("matches" in data) || !Array.isArray(data.matches)) throw new Error("Invalid response");
    const matches = data.matches.slice(0, 50).map((m: Record<string, unknown>) => ({
      slug: typeof m.slug === "string" ? m.slug : "",
      home: typeof m.home === "string" ? m.home : "Ev sahibi",
      away: typeof m.away === "string" ? m.away : "Deplasman",
      home_score: typeof m.home_score === "number" ? m.home_score : null,
      away_score: typeof m.away_score === "number" ? m.away_score : null,
      status: typeof m.status === "string" ? m.status : "unknown",
      status_text: typeof m.status_text === "string" ? m.status_text : "",
      time: typeof m.time === "string" ? m.time : null,
    }));
    return NextResponse.json({ matches, updated: new Date().toISOString(), provider: "SportScore" }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } });
  } catch {
    return NextResponse.json({ error: "Canlı maç verisi şu anda alınamıyor.", matches: [] }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim() ?? "";
  if (!slug || slug.length > 180 || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: "Geçersiz maç kimliği." }, { status: 400 });
  }
  try {
    const url = new URL("https://sportscore.com/api/widget/match/");
    url.searchParams.set("sport", "football");
    url.searchParams.set("slug", slug);
    const response = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(9000) });
    if (!response.ok) throw new Error("Upstream status " + response.status);
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid payload");
    return NextResponse.json({ data, provider: "SportScore" }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } });
  } catch {
    return NextResponse.json({ error: "Maç ayrıntıları şu anda alınamıyor." }, { status: 503 });
  }
}

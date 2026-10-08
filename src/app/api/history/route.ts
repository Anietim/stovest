import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DAYS: Record<string, number> = { "7D": 7, "1M": 30, "3M": 90, "1Y": 365 };
const YAHOO_RANGE: Record<string, string> = { "7D": "5d", "1M": "1mo", "3M": "3mo", "1Y": "1y" };

// Returns { available, closes: number[] } (raw closes in the stock's own currency; client rescales)
export async function GET(req: Request) {
  const u = new URL(req.url);
  const symbol = (u.searchParams.get("symbol") || "").toUpperCase();
  const exchange = (u.searchParams.get("exchange") || "").toUpperCase();
  const range = u.searchParams.get("range") || "7D";
  if (!/^[A-Z0-9.\-]{1,15}$/.test(symbol) || !DAYS[range]) {
    return NextResponse.json({ available: false, reason: "bad_request" }, { status: 400 });
  }

  try {
    if (exchange === "NGX") {
      const key = req.headers.get("x-ngnmarket-key") || process.env.NGNMARKET_API_KEY;
      if (!key) return NextResponse.json({ available: false, reason: "no_key" });
      const to = new Date();
      const from = new Date(Date.now() - DAYS[range] * 86400000);
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const r = await fetch(
        `https://api.ngnmarket.com/v1/companies/${symbol}/chart?from=${iso(from)}&to=${iso(to)}&format=ohlcv`,
        { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" }
      );
      if (r.status === 401 || r.status === 402 || r.status === 403) {
        return NextResponse.json({ available: false, reason: "plan" });
      }
      if (!r.ok) return NextResponse.json({ available: false, reason: `ngn_${r.status}` });
      const body = await r.json();
      const d = body?.data;
      const rows: any[] = [d, d?.data, d?.prices, d?.chart, d?.history, d?.candles, d?.ohlcv].find(Array.isArray) || [];
      const closes = rows.map((x) => Number(x?.close ?? x?.c)).filter((n) => isFinite(n) && n > 0);
      return NextResponse.json({ available: closes.length > 1, closes, reason: closes.length > 1 ? undefined : "empty" });
    }

    const ySym = exchange === "JSE" && !symbol.includes(".") ? `${symbol}.JO` : symbol;
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySym)}?range=${YAHOO_RANGE[range]}&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
    );
    if (!r.ok) return NextResponse.json({ available: false, reason: `yahoo_${r.status}` });
    const j = await r.json();
    const raw: (number | null)[] = j?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
    const closes = raw.filter((n): n is number => typeof n === "number" && n > 0);
    return NextResponse.json({ available: closes.length > 1, closes });
  } catch {
    return NextResponse.json({ available: false, reason: "network" });
  }
}
import type { LiveQuote } from "./marketDataService";

// Live Nigerian Exchange quotes via NGN Market API (free key: ngnmarket.com).
// Server-side cache protects the 3,000 calls/month free quota (data updates ~every 20 min).
const TTL_MS = 20 * 60 * 1000;
const cache: Record<string, { at: number; data: LiveQuote[] }> = {};

export async function fetchNgxQuotes(apiKey?: string): Promise<LiveQuote[]> {
  if (!apiKey) return [];
  const hit = cache[apiKey];
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  try {
    const [res, fx] = await Promise.all([
      fetch("https://api.ngnmarket.com/v1/companies?limit=50&page=1&sort=market_cap&order=desc", {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      }),
      fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" }),
    ]);
    if (!res.ok) throw new Error(`NGN Market ${res.status}`);
    const body = await res.json();
    if (!body?.success) throw new Error(body?.error?.message || "NGN Market error");
    const list: any[] = Array.isArray(body.data) ? body.data : body.data?.data || [];
    const ngnPerUsd = Number((await fx.json())?.rates?.NGN) || 1540;

    const data: LiveQuote[] = list
      .map((c) => {
        const ngn = Number(c.price ?? c.todays_close);
        if (!isFinite(ngn) || ngn <= 0) return null;
        const pct = Number(c.price_change_percent ?? c.change_percent ?? 0);
        const chg = Number(c.price_change ?? c.change ?? 0);
        return {
          symbol: String(c.symbol),
          name: String(c.name || c.symbol),
          price: Number((ngn / ngnPerUsd).toFixed(4)),
          change: Number((chg / ngnPerUsd).toFixed(4)),
          changePercent: Number(pct.toFixed(2)),
          currency: "NGN",
          exchange: "NGX",
          country: "Nigeria",
          flag: "🇳🇬",
          region: "Africa" as const,
          live: true,
          source: "NGN Market (NGX)",
          marketCap: c.market_cap ? `₦${(Number(c.market_cap) / 1e9).toFixed(0)}B` : undefined,
          volume: c.volume ? Number(c.volume).toLocaleString() : undefined,
        } as LiveQuote;
      })
      .filter(Boolean) as LiveQuote[];

    cache[apiKey] = { at: Date.now(), data };
    return data;
  } catch (e) {
    console.error("NGX fetch failed:", e);
    return hit?.data || [];
  }
}
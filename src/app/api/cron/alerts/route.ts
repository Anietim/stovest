import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { fetchAllLiveQuotes, fetchLiveExchangeRates, type LiveQuote } from "@/services/marketDataService";
import { fetchNgxQuotes } from "@/services/ngxService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const norm = (s: string) => s.toUpperCase().replace(/\.JO$/, "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// Call every 15-30 min (cron-job.org) or daily (Vercel cron). Protected by CRON_SECRET.
// Add ?dry=1 to see what WOULD be sent without emailing or updating anything.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const ok = secret && (req.headers.get("authorization") === `Bearer ${secret}` || url.searchParams.get("secret") === secret);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dry = url.searchParams.get("dry") === "1";

  const admin = supabaseAdmin();
  const { data: rows } = await admin.from("watchlist").select("id,user_id,symbol,name,exchange,alert_threshold_pct,last_alert_price");
  if (!rows?.length) return NextResponse.json({ watching: 0 });

  const ids = Array.from(new Set(rows.map((r: any) => r.user_id as string)));
  const { data: profiles } = await admin.from("profiles").select("id,email,full_name,plan,plan_expires_at,alerts_enabled").in("id", ids);
  const eligible = new Map<string, any>(
    (profiles || [])
      .filter((p: any) => p.plan === "pro" && (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date()) && p.alerts_enabled && p.email)
      .map((p: any) => [p.id, p] as [string, any])
  );

  const [yahoo, ngx, fx] = await Promise.all([
    fetchAllLiveQuotes({ finnhub: process.env.FINNHUB_API_KEY, eodhd: process.env.EODHD_API_KEY }),
    fetchNgxQuotes(process.env.NGNMARKET_API_KEY),
    fetchLiveExchangeRates(),
  ]);
  const quotes = new Map<string, LiveQuote>();
  [...yahoo.filter((q) => q.live && q.exchange !== "NGX"), ...ngx].forEach((q) => quotes.set(norm(q.symbol), q));

  const money = (q: LiveQuote) =>
    q.exchange === "NGX" ? `₦${(q.price * (fx.NGN || 1)).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`
    : q.exchange === "JSE" ? `R${(q.price * (fx.ZAR || 1)).toFixed(2)}`
    : `$${q.price.toFixed(2)}`;

  type Move = { rowId: string; symbol: string; name: string; pct: number; price: number; priceText: string };
  const byUser = new Map<string, Move[]>();
  let baselines = 0;

  for (const r of rows) {
    if (!eligible.has(r.user_id)) continue;
    const q = quotes.get(norm(r.symbol));
    if (!q) continue;
    if (!r.last_alert_price) { // first time: remember today's price as the starting point
      if (!dry) await admin.from("watchlist").update({ last_alert_price: q.price }).eq("id", r.id);
      baselines++;
      continue;
    }
    const pct = ((q.price - r.last_alert_price) / r.last_alert_price) * 100;
    if (Math.abs(pct) >= Number(r.alert_threshold_pct)) {
      const list = byUser.get(r.user_id) || [];
      list.push({ rowId: r.id, symbol: r.symbol, name: r.name || r.symbol, pct, price: q.price, priceText: money(q) });
      byUser.set(r.user_id, list);
    }
  }

  let sent = 0;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  for (const [uid, moves] of Array.from(byUser.entries())) {
    if (dry) continue;
    const p = eligible.get(uid)!;
    const rowsHtml = moves.map((m) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee"><b>${esc(m.symbol)}</b><br><span style="color:#666;font-size:12px">${esc(m.name)}</span></td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${esc(m.priceText)}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;color:${m.pct >= 0 ? "#059669" : "#e11d48"}">${m.pct >= 0 ? "▲" : "▼"} ${Math.abs(m.pct).toFixed(1)}%</td></tr>`
    ).join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto"><h2 style="color:#1868fe">Stovest alert</h2>` +
      `<p>Hi ${esc(p.full_name?.split(" ")[0] || "there")}, stocks on your watchlist moved:</p><table style="width:100%;border-collapse:collapse">${rowsHtml}</table>` +
      `<p style="margin-top:20px">${site ? `<a href="${site}" style="color:#1868fe">Open Stovest</a> · ` : ""}Turn alerts off anytime in your Profile.</p>` +
      `<p style="color:#888;font-size:11px">Prices may be delayed. This is information, not financial advice.</p></div>`;
    const subject = moves.length === 1 ? `${moves[0].symbol} ${moves[0].pct >= 0 ? "up" : "down"} ${Math.abs(moves[0].pct).toFixed(1)}%` : `${moves.length} watchlist stocks moved`;
    if (await sendEmail(p.email!, subject, html)) {
      sent++;
      for (const m of moves) await admin.from("watchlist").update({ last_alert_price: m.price, last_alert_at: new Date().toISOString() }).eq("id", m.rowId);
    }
  }

  return NextResponse.json({
    watching: rows.length, eligibleUsers: eligible.size, baselinesSet: baselines,
    moved: Array.from(byUser.values()).reduce((n, m) => n + m.length, 0), emailsSent: sent, dry,
    ...(dry ? { wouldAlert: Array.from(byUser.values()).map((m) => m.map((x) => `${x.symbol} ${x.pct.toFixed(1)}%`)) } : {}),
  });
}
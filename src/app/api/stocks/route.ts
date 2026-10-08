import { NextResponse } from "next/server";
import {
  fetchAllLiveQuotes,
  fetchLiveExchangeRates,
} from "@/services/marketDataService";
import { fetchNgxQuotes } from "@/services/ngxService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const exchange = searchParams.get("exchange");

    const [fxRates, yahooQuotes, ngxQuotes] = await Promise.all([
      fetchLiveExchangeRates(),
      fetchAllLiveQuotes({
        finnhub: request.headers.get("x-finnhub-key") || process.env.FINNHUB_API_KEY || undefined,
        eodhd: request.headers.get("x-eodhd-key") || process.env.EODHD_API_KEY || undefined,
      }),
      fetchNgxQuotes(request.headers.get("x-ngnmarket-key") || process.env.NGNMARKET_API_KEY || undefined),
    ]);

    // Live NGX feed replaces Yahoo's (unreliable) Nigerian tickers when available
    let data = ngxQuotes.length ? [...yahooQuotes.filter((q) => q.exchange !== "NGX"), ...ngxQuotes] : yahooQuotes;

    if (symbol) {
      data = data.filter(
        (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
      );
    }

    if (exchange) {
      data = data.filter(
        (s) => s.exchange.toLowerCase() === exchange.toLowerCase()
      );
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      dataSource: "Live Yahoo Finance & Open ER-API",
      status: data.some((d) => d.live) ? "live" : "fallback",
      liveCount: data.filter((d) => d.live).length,
      rates: fxRates,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Failed to fetch market data",
      },
      { status: 500 }
    );
  }
}
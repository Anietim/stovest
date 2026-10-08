"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Plus,
  Check,
  Building2,
  DollarSign,
  Activity,
  Layers,
  BarChart2,
  Globe2,
} from "lucide-react";
import { CurrencyCode } from "../types";
import { CURRENCY_RATES } from "../data/mockData";

interface StockDetailModalProps {
  stock: any;
  currency: CurrencyCode;
  onClose: () => void;
  onAddToPortfolio: (stock: any, units: number) => void;
}

function StockDetailModalInner({
  stock,
  currency,
  onClose,
  onAddToPortfolio,
}: StockDetailModalProps) {
  const [tradeUnits, setTradeUnits] = useState(10);
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [chartRange, setChartRange] = useState<"7D" | "1M" | "3M" | "1Y">("7D");

  const [history, setHistory] = useState<number[] | null>(null);
  const [histMsg, setHistMsg] = useState("Loading price history...");
  const histTicker = stock.ticker || stock.symbol;
  const histExchange = stock.exchange || "";

  useEffect(() => {
    let alive = true;
    setHistory(null);
    setHistMsg("Loading price history...");
    const headers: Record<string, string> = {};
    try {
      const k = localStorage.getItem("STOVEST_NGN_KEY");
      if (k) headers["x-ngnmarket-key"] = k;
    } catch {}
    fetch(`/api/history?symbol=${encodeURIComponent(histTicker)}&exchange=${encodeURIComponent(histExchange)}&range=${chartRange}`, { headers })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.available) setHistory(j.closes);
        else setHistMsg(
          j.reason === "plan" ? "NGX price history needs the NGN Market Hobby plan"
          : j.reason === "no_key" ? "Add your NGN Market key to see NGX history"
          : "Price history not available for this stock"
        );
      })
      .catch(() => alive && setHistMsg("Price history not available"));
    return () => { alive = false; };
  }, [histTicker, histExchange, chartRange]);

  const rateInfo = CURRENCY_RATES[currency];

  // Normalize stock properties safely
  const ticker = stock.ticker || stock.symbol || "STOCK";
  const name = stock.name || ticker;
  const exchange = stock.exchange || "GLOBAL";
  const country = stock.country || (exchange === "NGX" ? "Nigeria" : exchange === "JSE" ? "South Africa" : exchange === "NSE" ? "Kenya" : "Global");
  const flag = stock.flag || (exchange === "NGX" ? "🇳🇬" : exchange === "JSE" ? "🇿🇦" : exchange === "NSE" ? "🇰🇪" : "🌐");
  
  const currentPriceUSD = typeof stock.priceUSD === "number" ? stock.priceUSD : typeof stock.price === "number" ? stock.price : 150.0;
  const changePercent = typeof stock.changePercent === "number" ? stock.changePercent : 1.45;
  const isPositive = changePercent >= 0;

  // Format currency
  const formatVal = (valUSD: number) => {
    const converted = valUSD * rateInfo.rate;
    return `${rateInfo.symbol} ${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const displayPrice = formatVal(currentPriceUSD);
  const totalCost = formatVal(currentPriceUSD * tradeUnits);

  // Financial multiples calculation
  const peRatio = "N/A";
  const eps = "N/A";
  const divYield = "N/A";
  const low52W = currentPriceUSD * 0.72;
  const high52W = currentPriceUSD * 1.35;
  const rangeProgress = Math.min(100, Math.max(10, ((currentPriceUSD - low52W) / (high52W - low52W)) * 100));

  // Generate SVG Mini Chart
  const chartPoints = useMemo(() => {
    if (!history || history.length < 2) return [];
    // rescale so the last point equals the live price (keeps currency consistent)
    const last = history[history.length - 1];
    const rawSparkline = history.map((v) => (v / last) * currentPriceUSD);

    const min = Math.min(...rawSparkline);
    const max = Math.max(...rawSparkline);
    const range = max - min || 1;
    const w = 460;
    const h = 100;

    return rawSparkline.map((val, idx) => {
      const x = (idx / (rawSparkline.length - 1)) * (w - 20) + 10;
      const y = h - ((val - min) / range) * (h - 25) - 12;
      return { x, y, val };
    });
  }, [history, currentPriceUSD]);

  const pathD = useMemo(() => {
    if (chartPoints.length === 0) return "";
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [chartPoints]);

  const areaD = useMemo(() => {
    if (!pathD || chartPoints.length === 0) return "";
    const firstX = chartPoints[0].x;
    const lastX = chartPoints[chartPoints.length - 1].x;
    return `${pathD} L ${lastX} 100 L ${firstX} 100 Z`;
  }, [pathD, chartPoints]);

  const handleSimulateBuy = () => {
    onAddToPortfolio({ ...stock, ticker, name, priceUSD: currentPriceUSD, exchange, country }, tradeUnits);
    setTradeSuccess(true);
    setTimeout(() => {
      setTradeSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-[#1b253b] rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#121827] border border-[#1c263c] text-gray-400 hover:text-white hover:bg-[#182136] transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Block */}
        <div className="flex items-center gap-3.5 mb-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#141c2e] border border-blue-500/30 flex items-center justify-center text-2xl shadow-lg shrink-0">
            {flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">{ticker}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-500/30 font-semibold font-mono">
                {exchange}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">· {country}</span>
            </div>
            <p className="text-xs text-gray-300 font-medium mt-0.5">{name}</p>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {/* Price Banner */}
          <div className="p-4 rounded-2xl bg-[#101625] border border-[#1a2338] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Live Market Valuation
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-sans">
                {displayPrice}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isPositive
                    ? "bg-emerald-950/70 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-950/70 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
              <span className="text-[10px] text-gray-500 block mt-1">24h Day Range</span>
            </div>
          </div>

          {/* Mini Interactive Price Chart */}
          <div className="rounded-2xl bg-[#101625] border border-[#1a2338] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Price Trajectory
              </span>
              <div className="flex items-center gap-1 text-[10px] bg-[#0c101b] p-0.5 rounded-lg border border-[#1a243a]">
                {(["7D", "1M", "3M", "1Y"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${
                      chartRange === r
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Wave */}
            <div className="w-full h-24 overflow-hidden pt-1">
              <svg viewBox="0 0 460 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1868fe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1868fe" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {chartPoints.length === 0 && (
                  <text x="230" y="55" textAnchor="middle" fill="#6b7280" fontSize="11">{histMsg}</text>
                )}
                <path d={areaD} fill="url(#modalGradient)" />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#1d72fe"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <div className="p-3.5 rounded-2xl bg-[#101625] border border-[#1a2338]">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
              <span>52W Low: <strong className="text-gray-300">{formatVal(low52W)}</strong></span>
              <span className="font-semibold text-gray-300">52-Week Range</span>
              <span>52W High: <strong className="text-gray-300">{formatVal(high52W)}</strong></span>
            </div>
            <div className="h-2 w-full bg-[#162035] rounded-full overflow-hidden relative">
              <div
                style={{ width: `${rangeProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full"
              />
            </div>
          </div>

          {/* Fundamentals & Valuation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#101625] border border-[#1a2338]">
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">P/E Ratio</span>
              <span className="font-bold text-gray-200 mt-0.5 block">{peRatio}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#101625] border border-[#1a2338]">
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">EPS (TTM)</span>
              <span className="font-bold text-gray-200 mt-0.5 block">{rateInfo.symbol} {eps}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#101625] border border-[#1a2338]">
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Div Yield</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{divYield}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#101625] border border-[#1a2338]">
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Market Cap</span>
              <span className="font-bold text-gray-200 mt-0.5 block">{stock.marketCap || "$ 45.2 B"}</span>
            </div>
          </div>

          {/* Company Description */}
          {stock.description && (
            <div className="p-3.5 rounded-2xl bg-[#101625] border border-[#1a2338]">
              <span className="text-[11px] font-semibold text-gray-400 block mb-1">Company Overview</span>
              <p className="text-xs text-gray-300 leading-relaxed">{stock.description}</p>
            </div>
          )}

          {/* Paper Trade / Buy Order Simulator */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#131d33] to-[#0f1728] border border-[#212f4d]">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-gray-200 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Simulate Paper Order
              </span>
              <span className="text-xs text-gray-300 font-mono">
                Order Value: <strong className="text-white text-sm">{totalCost}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#232f4e] rounded-xl overflow-hidden bg-[#0c101b]">
                <button
                  onClick={() => setTradeUnits(Math.max(1, tradeUnits - 5))}
                  className="px-3.5 py-2 text-gray-400 hover:text-white hover:bg-[#162035] transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-white min-w-[70px] text-center">
                  {tradeUnits} Units
                </span>
                <button
                  onClick={() => setTradeUnits(tradeUnits + 5)}
                  className="px-3.5 py-2 text-gray-400 hover:text-white hover:bg-[#162035] transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleSimulateBuy}
                disabled={tradeSuccess}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  tradeSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1868fe] hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                }`}
              >
                {tradeSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Portfolio!
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Save to My Portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper: bail out BEFORE any hooks run (fixes "Rendered more hooks than during the previous render")
export default function StockDetailModal(props: StockDetailModalProps) {
  if (!props.stock) return null;
  return <StockDetailModalInner {...props} />;
}
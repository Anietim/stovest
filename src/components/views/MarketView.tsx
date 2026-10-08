"use client";

import React, { useState } from "react";
import { Search, Filter, Plus, Star, TrendingUp, TrendingDown, Globe2 } from "lucide-react";
import { MarketStock, CurrencyCode } from "../../types";
import { CURRENCY_RATES } from "../../data/mockData";

interface MarketViewProps {
  stocks: MarketStock[];
  currency: CurrencyCode;
  onSelectStock: (stock: MarketStock) => void;
  onQuickAdd: (stock: MarketStock) => void;
}

export default function MarketView({
  stocks,
  currency,
  onSelectStock,
  onQuickAdd,
}: MarketViewProps) {
  const [selectedExchange, setSelectedExchange] = useState<string>("ALL");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const rateInfo = CURRENCY_RATES[currency];

  const exchanges = [
    { id: "ALL", label: "All Exchanges" },
    { id: "NGX", label: "🇳🇬 Nigeria (NGX)" },
    { id: "JSE", label: "🇿🇦 South Africa (JSE)" },
    { id: "NSE", label: "🇰🇪 Kenya (NSE)" },
    { id: "US", label: "🇺🇸 US (NASDAQ & NYSE)" },
  ];

  const sectors = ["ALL", "Fintech & Banking", "Tech & Media", "Telecom", "Industrial Materials", "Automotive"];

  const filtered = stocks.filter((stock) => {
    // Exchange filter
    if (selectedExchange === "NGX" && stock.exchange !== "NGX") return false;
    if (selectedExchange === "JSE" && stock.exchange !== "JSE") return false;
    if (selectedExchange === "NSE" && stock.exchange !== "NSE") return false;
    if (selectedExchange === "US" && !["NASDAQ", "NYSE"].includes(stock.exchange)) return false;

    // Search query
    if (
      searchQuery &&
      !stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const formatPrice = (usd: number) => {
    const val = usd * rateInfo.rate;
    return `${rateInfo.symbol} ${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-500" />
            African & Global Market Explorer
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Screen equities across Lagos (NGX), Johannesburg (JSE), Nairobi (NSE), and Wall Street
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol or company..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-[#101524] border border-[#1d273f] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Exchange Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {exchanges.map((ex) => {
          const isActive = selectedExchange === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => setSelectedExchange(ex.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#1868fe] text-white shadow-md shadow-blue-600/30 font-bold"
                  : "bg-[#101524] text-gray-400 border border-[#1b233a] hover:text-white hover:bg-[#151c2e]"
              }`}
            >
              {ex.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((stock) => {
          const isPositive = stock.changePercent >= 0;

          return (
            <div
              key={stock.ticker}
              onClick={() => onSelectStock(stock)}
              className="rounded-3xl bg-[#0c101b] hover:bg-[#101625] border border-[#172033] hover:border-blue-500/40 p-5 shadow-card transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Top: Flag, Ticker, Exchange Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#141c2f] border border-[#212c45] flex items-center justify-center text-sm">
                      {stock.flag || "📈"}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {stock.ticker}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {stock.exchange}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isPositive
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-950/60 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {stock.changePercent.toFixed(1)}%
                  </span>
                </div>

                {/* Company Name & Sector */}
                <p className="text-xs font-semibold text-gray-200 line-clamp-1">{stock.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stock.sector}</p>

                {/* Price */}
                <div className="mt-4 pt-3 border-t border-[#161e30]">
                  <span className="text-[10px] text-gray-500">Live Quote</span>
                  <div className="text-xl font-extrabold text-white">
                    {formatPrice(stock.priceUSD)}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400">
                  <span>Cap: <strong className="text-gray-300">{stock.marketCap}</strong></span>
                  <span>Vol: <strong className="text-gray-300">{stock.volume}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#161e30] flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(stock);
                  }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invest</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

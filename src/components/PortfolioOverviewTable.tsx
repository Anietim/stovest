"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { MarketStock, CurrencyCode } from "../types";
import { CURRENCY_RATES } from "../data/mockData";

interface PortfolioOverviewTableProps {
  stocks: MarketStock[];
  currency: CurrencyCode;
  onSelectStock: (stock: MarketStock) => void;
}

export default function PortfolioOverviewTable({
  stocks,
  currency,
  onSelectStock,
}: PortfolioOverviewTableProps) {
  const [filterTab, setFilterTab] = useState<"All" | "Gainers" | "Losers">("All");
  const [regionFilter, setRegionFilter] = useState<"ALL" | "AFRICA" | "US">("ALL");

  const rateInfo = CURRENCY_RATES[currency];

  const filteredStocks = stocks.filter((stock) => {
    // Filter by tab
    if (filterTab === "Gainers" && stock.changePercent <= 0) return false;
    if (filterTab === "Losers" && stock.changePercent >= 0) return false;

    // Filter by region
    if (regionFilter === "AFRICA" && !["NGX", "JSE", "NSE"].includes(stock.exchange)) {
      return false;
    }
    if (regionFilter === "US" && !["NASDAQ", "NYSE"].includes(stock.exchange)) {
      return false;
    }

    return true;
  });

  // Render mini SVG sparkline
  const renderSparkline = (data: number[], isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 75;
    const height = 24;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const pathData = `M ${points.join(" L ")}`;
    const strokeColor = isPositive ? "#05C46B" : "#FF3F34";

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End pulse dot */}
        <circle
          cx={width}
          cy={points[points.length - 1].split(",")[1]}
          r="2.5"
          fill={strokeColor}
        />
      </svg>
    );
  };

  const formatPrice = (priceUSD: number) => {
    const converted = priceUSD * rateInfo.rate;
    return `${rateInfo.symbol} ${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="flex-1 rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card hover:border-[#202c47] transition-all">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Portfolio Overview
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Key African & Global market movers
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-[#101524] p-1 rounded-full border border-[#1b233a]">
          {(["All", "Gainers", "Losers"] as const).map((tab) => {
            const isActive = filterTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1868fe] text-white shadow-md shadow-blue-600/40"
                    : "text-gray-400 hover:text-white hover:bg-[#151c2e]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region quick filter bar */}
      <div className="flex items-center gap-2 mb-4 text-[11px]">
        <span className="text-gray-500 font-medium">Exchanges:</span>
        <button
          onClick={() => setRegionFilter("ALL")}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            regionFilter === "ALL"
              ? "bg-[#192238] text-blue-400 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          All Markets
        </button>
        <button
          onClick={() => setRegionFilter("AFRICA")}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            regionFilter === "AFRICA"
              ? "bg-[#192238] text-blue-400 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Pan-African (NGX, JSE, NSE)
        </button>
        <button
          onClick={() => setRegionFilter("US")}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            regionFilter === "US"
              ? "bg-[#192238] text-blue-400 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          US (NASDAQ, NYSE)
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#161e30] text-gray-500 font-medium">
              <th className="pb-3 pl-1">Stock</th>
              <th className="pb-3 text-right">Last Price</th>
              <th className="pb-3 text-right">Change %</th>
              <th className="pb-3 text-right hidden sm:table-cell">Market Cap</th>
              <th className="pb-3 text-right hidden md:table-cell">Volume</th>
              <th className="pb-3 text-right pr-2">Last 7 days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#131b2c]">
            {filteredStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              return (
                <tr
                  key={stock.ticker}
                  onClick={() => onSelectStock(stock)}
                  className="hover:bg-[#121827] cursor-pointer transition-colors group"
                >
                  {/* Stock Ticker & Flag */}
                  <td className="py-3.5 pl-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#141c2f] border border-[#212c45] flex items-center justify-center font-bold text-[11px] text-gray-200 group-hover:border-blue-500/50 transition-colors">
                        {stock.flag || "📈"}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          {stock.ticker}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#172033] text-gray-400 font-mono">
                            {stock.exchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[120px] sm:max-w-[160px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last Price */}
                  <td className="py-3.5 text-right font-bold text-gray-200">
                    {formatPrice(stock.priceUSD)}
                  </td>

                  {/* Change % */}
                  <td className="py-3.5 text-right font-semibold">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                        isPositive
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-950/60 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {stock.changePercent.toFixed(1)}%
                    </span>
                  </td>

                  {/* Market Cap */}
                  <td className="py-3.5 text-right text-gray-400 font-medium hidden sm:table-cell">
                    {stock.marketCap}
                  </td>

                  {/* Volume */}
                  <td className="py-3.5 text-right text-gray-400 font-medium hidden md:table-cell">
                    {stock.volume}
                  </td>

                  {/* Sparkline */}
                  <td className="py-3.5 text-right pr-2">
                    <div className="inline-block">
                      {renderSparkline(stock.sparkline, isPositive)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { StockHolding, CurrencyCode } from "../types";
import { CURRENCY_RATES } from "../data/mockData";

interface PortfolioHoldingsScrollProps {
  holdings: StockHolding[];
  currency: CurrencyCode;
  onSelectStock: (stock: StockHolding) => void;
  onSeeAll: () => void;
}

export default function PortfolioHoldingsScroll({
  holdings,
  currency,
  onSelectStock,
  onSeeAll,
}: PortfolioHoldingsScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rateInfo = CURRENCY_RATES[currency];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const getCompanyBrandSymbol = (ticker: string) => {
    switch (ticker) {
      case "AAPL":
        return "";
      case "TSLA":
        return "⚡";
      case "MSFT":
        return "⊞";
      case "GOOG":
        return "G";
      case "NVDA":
        return "✦";
      case "MTNN":
        return "🟡";
      case "NPN":
        return "🇿🇦";
      case "SCOM":
        return "🇰🇪";
      default:
        return "📈";
    }
  };

  return (
    <div className="flex-1 rounded-3xl bg-[#0c101b] border border-[#172033] p-6 flex flex-col justify-between shadow-card hover:border-[#202c47] transition-all overflow-hidden min-h-[170px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-300 tracking-wide">
            My Portfolio
          </span>
          <span className="text-[11px] font-medium text-gray-500 bg-[#121828] px-2 py-0.5 rounded-full border border-[#1c253d]">
            {holdings.length} Assets
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll navigation arrows */}
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-[#131929] border border-[#1e2740] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a233a] transition-colors"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-[#131929] border border-[#1e2740] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a233a] transition-colors"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* See All Pill Button */}
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#141b2c] border border-[#212c45] text-gray-300 hover:text-white hover:border-gray-500 transition-colors ml-1"
          >
            <span>See all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-1"
      >
        {holdings.map((stock) => {
          const isPositive = stock.changePercent >= 0;
          const displayPrice = (stock.priceUSD * rateInfo.rate).toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          });

          return (
            <div
              key={stock.ticker}
              onClick={() => onSelectStock(stock)}
              className="min-w-[135px] sm:min-w-[145px] bg-[#111624] hover:bg-[#151c2e] border border-[#1a2338] hover:border-blue-500/40 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 group"
            >
              {/* Top: Price and return badge */}
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {rateInfo.symbol} {displayPrice}
                </div>
                <div
                  className={`text-[10px] font-semibold mt-0.5 ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stock.changeValue.toFixed(2)} ({isPositive ? "+" : ""}
                  {stock.changePercent.toFixed(1)}%)
                </div>
              </div>

              {/* Bottom: Icon, Ticker, Units */}
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#182136]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{getCompanyBrandSymbol(stock.ticker)}</span>
                  <span className="text-[11px] font-bold text-gray-300 tracking-tight">
                    {stock.ticker}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  Units <span className="text-gray-200 font-semibold">{stock.units}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

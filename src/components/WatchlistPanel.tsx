"use client";

import React, { useState } from "react";
import { Star, Plus, Check } from "lucide-react";
import { WatchlistStock, CurrencyCode } from "../types";
import { CURRENCY_RATES } from "../data/mockData";

interface WatchlistPanelProps {
  initialItems: WatchlistStock[];
  currency: CurrencyCode;
  onSelectStock: (stock: WatchlistStock) => void;
  onAddToPortfolio?: (ticker: string) => void;
}

export default function WatchlistPanel({
  initialItems,
  currency,
  onSelectStock,
  onAddToPortfolio,
}: WatchlistPanelProps) {
  const [filterTab, setFilterTab] = useState<"most_viewed" | "gainers" | "losers">("most_viewed");
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({
    Spotify: true,
    Amazon: true,
    "Jumia Tech": true,
  });
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTickerInput, setNewTickerInput] = useState("");
  const [items, setItems] = useState<WatchlistStock[]>(initialItems);

  const rateInfo = CURRENCY_RATES[currency];

  const toggleSave = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedItems((prev) => ({
      ...prev,
      [ticker]: !prev[ticker],
    }));
  };

  const handleAddNewTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerInput.trim()) return;

    const newStock: WatchlistStock = {
      ticker: newTickerInput.toUpperCase().trim(),
      name: `EXCH: ${newTickerInput.toUpperCase().trim()}`,
      exchange: "GLOBAL",
      priceUSD: 145.2,
      changePercent: 1.85,
      isPositive: true,
      type: "most_viewed",
    };

    setItems((prev) => [newStock, ...prev]);
    setSavedItems((prev) => ({ ...prev, [newStock.ticker]: true }));
    setNewTickerInput("");
    setShowAddInput(false);
  };

  const filteredItems = items.filter((item) => {
    if (filterTab === "gainers") return item.changePercent > 0;
    if (filterTab === "losers") return item.changePercent < 0;
    return true; // most_viewed
  });

  const getCompanyLogoIcon = (ticker: string) => {
    switch (ticker) {
      case "Spotify":
        return "🟢";
      case "Amazon":
        return "📦";
      case "Jumia Tech":
        return "🌍";
      case "MTN Nigeria":
        return "🟡";
      case "Safaricom":
        return "🇰🇪";
      case "Sasol":
        return "⚡";
      default:
        return "📊";
    }
  };

  return (
    <div className="w-full lg:w-80 rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card hover:border-[#202c47] transition-all flex flex-col justify-between shrink-0">
      <div>
        {/* Header & Filter Pills */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">Watchlist</h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#101524] p-1 rounded-full border border-[#1b233a]">
            {[
              { id: "most_viewed", label: "Most Viewed" },
              { id: "gainers", label: "Gainers" },
              { id: "losers", label: "Losers" },
            ].map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    isActive
                      ? "bg-[#1868fe] text-white shadow-sm shadow-blue-600/40"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Watchlist Stock Items */}
        <div className="space-y-2.5 mt-4">
          {filteredItems.map((item) => {
            const isSaved = !!savedItems[item.ticker];
            const displayPrice = (item.priceUSD * rateInfo.rate).toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            });

            return (
              <div
                key={item.ticker}
                onClick={() => onSelectStock(item)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#111624] hover:bg-[#151c2e] border border-[#1a2338] hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                {/* Left: Icon, Company Name, Exchange Subtitle */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#151c2e] border border-[#212c45] flex items-center justify-center text-sm shadow-inner">
                    {getCompanyLogoIcon(item.ticker)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {item.ticker}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {item.name}
                    </div>
                  </div>
                </div>

                {/* Right: Price, Change %, and Star Action */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-200">
                      {rateInfo.symbol} {displayPrice}
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${
                        item.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.changePercent >= 0 ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleSave(item.ticker, e)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-[#1a233a] transition-colors"
                    title={isSaved ? "Saved to Watchlist" : "Save to Watchlist"}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isSaved ? "fill-yellow-400 text-yellow-400" : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Stock to Watchlist Button */}
      <div className="mt-5 pt-3 border-t border-[#161e30]">
        {showAddInput ? (
          <form onSubmit={handleAddNewTicker} className="flex gap-2">
            <input
              type="text"
              value={newTickerInput}
              onChange={(e) => setNewTickerInput(e.target.value)}
              placeholder="Enter ticker (e.g. DANGCEM)..."
              autoFocus
              className="flex-1 bg-[#101524] border border-[#212c45] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddInput(false)}
              className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAddInput(true)}
            className="w-full py-2 px-3 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-[#1a2338] text-gray-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock to Watchlist</span>
          </button>
        )}
      </div>
    </div>
  );
}

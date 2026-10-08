"use client";

import React, { useState } from "react";
import {
  PieChart,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { StockHolding, CurrencyCode } from "../../types";
import { CURRENCY_RATES } from "../../data/mockData";

interface PortfolioViewProps {
  holdings: StockHolding[];
  currency: CurrencyCode;
  onSelectStock: (stock: StockHolding) => void;
  onSellUnits: (ticker: string, units: number) => void;
  onBuyMore: (stock: StockHolding) => void;
}

export default function PortfolioView({
  holdings,
  currency,
  onSelectStock,
  onSellUnits,
  onBuyMore,
}: PortfolioViewProps) {
  const rateInfo = CURRENCY_RATES[currency];

  const totalValueUSD = holdings.reduce(
    (acc, item) => acc + item.priceUSD * (item.units || 1),
    0
  );

  const totalInvestedUSD = holdings.reduce(
    (acc, item) => acc + (item.priceUSD * 0.95) * (item.units || 1), // simulated avg buy price
    0
  );

  const totalPnlUSD = totalValueUSD - totalInvestedUSD;
  const totalPnlPercent = ((totalPnlUSD / totalInvestedUSD) * 100);

  const formatPrice = (usd: number) => {
    const val = usd * rateInfo.rate;
    return `${rateInfo.symbol} ${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Allocation distribution
  const usHoldingsValue = holdings
    .filter((h) => h.region === "US")
    .reduce((acc, h) => acc + h.priceUSD * h.units, 0);
  const africanHoldingsValue = holdings
    .filter((h) => h.region === "Africa")
    .reduce((acc, h) => acc + h.priceUSD * h.units, 0);

  const usPercent = Math.round((usHoldingsValue / (totalValueUSD || 1)) * 100);
  const africaPercent = 100 - usPercent;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Portfolio Value */}
        <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card">
          <span className="text-xs font-semibold text-gray-400">Total Portfolio Value</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {formatPrice(totalValueUSD)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">Total Return:</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +{totalPnlPercent.toFixed(2)}% ({formatPrice(totalPnlUSD)})
            </span>
          </div>
        </div>

        {/* Regional Asset Allocation */}
        <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2">
              <span>Asset Allocation</span>
              <span className="text-blue-400 font-bold">Hybrid Global / Africa</span>
            </div>
            {/* Visual Bar */}
            <div className="h-3 w-full bg-[#161f33] rounded-full overflow-hidden flex my-2.5">
              <div
                style={{ width: `${usPercent}%` }}
                className="bg-blue-600 h-full"
                title={`US Equities: ${usPercent}%`}
              />
              <div
                style={{ width: `${africaPercent}%` }}
                className="bg-emerald-500 h-full"
                title={`African Equities: ${africaPercent}%`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span className="text-gray-300 font-medium">US Equities: {usPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-gray-300 font-medium">African Equities: {africaPercent}%</span>
            </div>
          </div>
        </div>

        {/* Buying Power / Paper Balance */}
        <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Cash / Buying Power</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatPrice(5420.50)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Available to invest across NGX, JSE, and US markets
          </p>
        </div>
      </div>

      {/* Detailed Holdings Table */}
      <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Your Stock Holdings</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Live tracking with real-time unrealized gains and losses
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#121827] border border-[#1d273f] text-gray-300 font-medium">
            {holdings.length} Assets in Portfolio
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#161e30] text-gray-500 font-medium">
                <th className="pb-3 pl-1">Asset</th>
                <th className="pb-3 text-right">Units Held</th>
                <th className="pb-3 text-right">Current Price</th>
                <th className="pb-3 text-right">Total Value</th>
                <th className="pb-3 text-right">24h Change</th>
                <th className="pb-3 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131b2c]">
              {holdings.map((stock) => {
                const stockValUSD = stock.priceUSD * stock.units;
                const isPositive = stock.changePercent >= 0;

                return (
                  <tr
                    key={stock.ticker}
                    className="hover:bg-[#121827] transition-colors group"
                  >
                    <td className="py-4 pl-1">
                      <div
                        onClick={() => onSelectStock(stock)}
                        className="cursor-pointer flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#141c2f] border border-[#212c45] flex items-center justify-center font-bold text-xs text-gray-200 group-hover:border-blue-500/50">
                          {stock.region === "Africa" ? "🌍" : "🇺🇸"}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 flex items-center gap-1.5">
                            {stock.ticker}
                            <span className="text-[10px] px-1.5 rounded bg-[#172033] text-gray-400 font-mono">
                              {stock.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400">{stock.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-right font-bold text-gray-200">
                      {stock.units.toLocaleString()}
                    </td>

                    <td className="py-4 text-right font-semibold text-gray-300">
                      {formatPrice(stock.priceUSD)}
                    </td>

                    <td className="py-4 text-right font-bold text-white">
                      {formatPrice(stockValUSD)}
                    </td>

                    <td className="py-4 text-right font-semibold">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                          isPositive
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-950/60 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onBuyMore(stock)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-all"
                          title="Buy more units"
                        >
                          Buy +
                        </button>
                        <button
                          onClick={() => onSellUnits(stock.ticker, Math.max(1, Math.floor(stock.units * 0.25)))}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-[11px] font-semibold transition-all"
                          title="Sell 25% of position"
                        >
                          Sell -
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

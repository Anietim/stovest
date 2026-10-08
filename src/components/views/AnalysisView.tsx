"use client";

import React from "react";
import { LineChart, BarChart3, TrendingUp, DollarSign, Percent, AlertCircle } from "lucide-react";
import { CurrencyCode } from "../../types";

interface AnalysisViewProps {
  currency: CurrencyCode;
}

export default function AnalysisView({ currency }: AnalysisViewProps) {
  const centralBankRates = [
    { country: "Nigeria (CBN)", flag: "🇳🇬", rate: "27.25%", trend: "Hawkish", inflation: "32.15%" },
    { country: "South Africa (SARB)", flag: "🇿🇦", rate: "8.00%", trend: "Easing", inflation: "4.40%" },
    { country: "Kenya (CBK)", flag: "🇰🇪", rate: "12.75%", trend: "Neutral", inflation: "4.30%" },
    { country: "United States (FED)", flag: "🇺🇸", rate: "4.75%", trend: "Dovish", inflation: "2.50%" },
  ];

  const valuationMultiples = [
    { ticker: "DANGCEM", name: "Dangote Cement", exchange: "NGX", pe: "14.2x", divYield: "6.8%", roe: "28.5%" },
    { ticker: "NPN", name: "Naspers Ltd", exchange: "JSE", pe: "18.5x", divYield: "0.5%", roe: "16.2%" },
    { ticker: "SCOM", name: "Safaricom PLC", exchange: "NSE", pe: "11.8x", divYield: "7.4%", roe: "35.1%" },
    { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", pe: "33.5x", divYield: "0.5%", roe: "147.2%" },
    { ticker: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", pe: "35.1x", divYield: "0.8%", roe: "38.5%" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Pan-African & Global Market Analytics
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Macroeconomic indicators, central bank benchmark rates, and comparative equity valuations
        </p>
      </div>

      {/* Central Bank Benchmark Rates */}
      <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card">
        <h3 className="text-sm font-bold text-white mb-1">Central Bank Benchmark Policy Rates</h3>
        <p className="text-xs text-gray-400 mb-4">
          Key monetary policy rates influencing currency volatility and local stock yields
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {centralBankRates.map((item) => (
            <div
              key={item.country}
              className="p-4 rounded-2xl bg-[#111624] border border-[#1a2338] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{item.flag}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#182136] text-blue-400">
                  {item.trend}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-300">{item.country}</span>
              <div className="text-2xl font-black text-white mt-1">{item.rate}</div>
              <span className="text-[11px] text-gray-400 mt-2">
                Headline Inflation: <strong className="text-gray-200">{item.inflation}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fundamental Valuation Comparison Table */}
      <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card">
        <h3 className="text-sm font-bold text-white mb-1">Comparative Fundamentals & Multiples</h3>
        <p className="text-xs text-gray-400 mb-4">
          Price-to-Earnings, Dividend Yields, and Return on Equity (ROE)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#161e30] text-gray-500 font-medium">
                <th className="pb-3 pl-1">Ticker / Company</th>
                <th className="pb-3 text-right">Exchange</th>
                <th className="pb-3 text-right">P/E Ratio</th>
                <th className="pb-3 text-right">Dividend Yield</th>
                <th className="pb-3 text-right pr-2">Return on Equity (ROE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131b2c]">
              {valuationMultiples.map((stock) => (
                <tr key={stock.ticker} className="hover:bg-[#121827] transition-colors">
                  <td className="py-3.5 pl-1">
                    <span className="font-bold text-white">{stock.ticker}</span>
                    <span className="text-gray-400 ml-2 text-[11px]">{stock.name}</span>
                  </td>
                  <td className="py-3.5 text-right font-mono text-gray-400">{stock.exchange}</td>
                  <td className="py-3.5 text-right font-bold text-gray-200">{stock.pe}</td>
                  <td className="py-3.5 text-right font-bold text-emerald-400">{stock.divYield}</td>
                  <td className="py-3.5 text-right font-bold text-blue-400 pr-2">{stock.roe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

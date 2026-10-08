"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: number;
  exchange: string;
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: "NGX ASI", name: "Nigeria All-Share", price: "98,450.2", change: 1.42, exchange: "NGX" },
  { symbol: "JSE Top 40", name: "South Africa Top 40", price: "76,820.5", change: 0.85, exchange: "JSE" },
  { symbol: "NSE 20", name: "Kenya 20 Share", price: "1,745.3", change: -0.31, exchange: "NSE" },
  { symbol: "S&P 500", name: "US Large Cap", price: "5,745.8", change: 0.54, exchange: "US" },
  { symbol: "NASDAQ", name: "US Tech 100", price: "18,180.2", change: 0.92, exchange: "US" },
  { symbol: "DANGCEM", name: "Dangote Cement", price: "₦ 690.00", change: 4.80, exchange: "NGX" },
  { symbol: "NPN", name: "Naspers Limited", price: "R 3,720.00", change: 1.65, exchange: "JSE" },
  { symbol: "SCOM", name: "Safaricom PLC", price: "KSh 19.50", change: -1.25, exchange: "NSE" },
  { symbol: "MTNN", name: "MTN Nigeria", price: "₦ 275.50", change: 2.45, exchange: "NGX" },
  { symbol: "AAPL", name: "Apple Inc.", price: "$ 232.15", change: 0.70, exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: "$ 128.40", change: 2.15, exchange: "NASDAQ" },
];

export default function LiveTickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null);

  // Simulate real-time price tick fluctuations every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const item = prev[randomIndex];
        const delta = (Math.random() * 0.4 - 0.2); // -0.2 to +0.2%
        const newChange = Number((item.change + delta).toFixed(2));
        
        setUpdatedIndex(randomIndex);
        setTimeout(() => setUpdatedIndex(null), 1500);

        const updated = [...prev];
        updated[randomIndex] = {
          ...item,
          change: newChange,
        };
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#070b13] border-b border-[#131b2d] py-1.5 px-4 overflow-hidden relative select-none">
      <div className="flex items-center gap-6 whitespace-nowrap animate-in fade-in duration-500 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-blue-400 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Live Ticker
        </div>

        {tickers.map((item, idx) => {
          const isPos = item.change >= 0;
          const isJustUpdated = updatedIndex === idx;

          return (
            <div
              key={item.symbol}
              className={`inline-flex items-center gap-2 text-xs transition-colors duration-300 shrink-0 ${
                isJustUpdated
                  ? isPos
                    ? "text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded"
                    : "text-rose-300 font-bold bg-rose-950/40 px-2 py-0.5 rounded"
                  : "text-gray-300"
              }`}
            >
              <span className="font-bold text-gray-200">{item.symbol}</span>
              <span className="text-[11px] text-gray-400 font-mono">{item.price}</span>
              <span
                className={`inline-flex items-center text-[10px] font-semibold ${
                  isPos ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPos ? "+" : ""}
                {item.change}%
              </span>
              <span className="text-gray-700 mx-1">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

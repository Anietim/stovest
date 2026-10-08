"use client";

import React, { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import { CurrencyCode } from "../types";
import { CURRENCY_RATES } from "../data/mockData";

interface TotalHoldingCardProps {
  currency: CurrencyCode;
  selectedRange: string;
  setSelectedRange: (r: string) => void;
  baseAmountUSD?: number;
}

export default function TotalHoldingCard({
  currency,
  selectedRange,
  setSelectedRange,
  baseAmountUSD = 12304.11,
}: TotalHoldingCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const rateInfo = CURRENCY_RATES[currency];
  const convertedAmount = baseAmountUSD * rateInfo.rate;
  const convertedReturn = 32.0 * rateInfo.rate;

  const formattedAmount =
    currency === "USD"
      ? `$ ${convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${rateInfo.symbol} ${convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formattedReturn =
    currency === "USD"
      ? `+$${convertedReturn.toFixed(0)}`
      : `+${rateInfo.symbol}${convertedReturn.toFixed(0)}`;

  const ranges = ["1D", "1W", "1M", "6M", "1Y"];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0c101b] border border-[#172033] p-6 flex flex-col justify-between shadow-card hover:border-[#202c47] transition-all min-h-[170px] wave-bg">
      {/* Background silk / fluid styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121828]/60 via-transparent to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <span className="text-sm font-semibold text-gray-300 tracking-wide">
          Total Holding
        </span>

        {/* Range Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#141b2c] border border-[#212c45] text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
          >
            <span>{selectedRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-[#101524] border border-[#212c45] rounded-xl shadow-2xl py-1 z-30">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedRange(r);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-[#19223a] transition-colors ${
                    selectedRange === r ? "text-blue-400 font-bold bg-[#141b2c]" : "text-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Values */}
      <div className="mt-4 z-10">
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          {formattedAmount}
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-xs text-gray-400 font-medium">Return</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            +3.6% ({formattedReturn})
          </span>
        </div>
      </div>
    </div>
  );
}

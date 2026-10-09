"use client";

import React, { useState } from "react";
import AuthButton from "./AuthButton";
import {
  Sparkles,
  Bell,
  Settings,
  ChevronDown,
  Globe,
  DollarSign,
  Menu,
} from "lucide-react";
import { CurrencyCode } from "../types";
import { CURRENCY_RATES } from "../data/mockData";

interface HeaderProps {
  onOpenAiSearchAction: (query?: string) => void;
  currency: CurrencyCode;
  setCurrencyAction: (c: CurrencyCode) => void;
  activeTopPill: string;
  setActiveTopPillAction: (pill: string) => void;
  onOpenSettingsAction?: () => void;
  onOpenMenuAction?: () => void;
}

export default function Header({
  onOpenAiSearchAction,
  currency,
  setCurrencyAction,
  activeTopPill,
  setActiveTopPillAction,
  onOpenSettingsAction,
  onOpenMenuAction,
}: HeaderProps) {
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onOpenAiSearchAction(searchInput);
    }
  };

  const topPills = ["Market", "Wallets", "Tools"];

  return (
    <header className="h-16 sm:h-20 border-b border-[#141b2c] px-3 sm:px-7 flex items-center justify-between gap-2 sm:gap-5 bg-[#090d16]/70 backdrop-blur-md sticky top-0 z-30">
      {onOpenMenuAction && (
        <button onClick={onOpenMenuAction} aria-label="Open menu" className="lg:hidden shrink-0 p-2.5 rounded-full bg-[#101524] border border-[#1b243b] text-gray-300 hover:text-white">
          <Menu className="w-4 h-4" />
        </button>
      )}
      {/* Left Action Pills & Currency Switcher */}
      <div className="flex items-center gap-2.5">
        {topPills.map((pill) => {
          const isActive = activeTopPill === pill;
          return (
            <button
              key={pill}
              onClick={() => setActiveTopPillAction(pill)}
              className={`hidden md:inline-flex px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-[#162035] text-white border border-blue-500/40 shadow-sm shadow-blue-500/20"
                  : "bg-[#101524] text-gray-400 border border-[#1b243b] hover:text-white hover:bg-[#161c2e]"
              }`}
            >
              {pill}
            </button>
          );
        })}

        {/* Currency Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#101524] text-blue-400 border border-blue-500/30 hover:bg-[#141c30] transition-colors"
            title="Switch Currency (Pan-African & Global)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{CURRENCY_RATES[currency].label}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
          </button>

          {currencyMenuOpen && (
            <div className="absolute left-0 mt-2 w-36 bg-[#0f1422] border border-[#1e2740] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrencyAction(c);
                    setCurrencyMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#182136] transition-colors ${
                    currency === c ? "text-blue-400 font-bold bg-[#141b2c]" : "text-gray-300"
                  }`}
                >
                  <span>{CURRENCY_RATES[c].label}</span>
                  {currency === c && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: AI Search Bar matching "Ask stocks.ai anything" */}
      <div className="flex-1 min-w-0 max-w-lg relative">
        <div
          onClick={() => onOpenAiSearchAction(searchInput)}
          className="group relative flex items-center bg-[#0d121f] hover:bg-[#111728] border border-[#1c2438] hover:border-blue-500/50 rounded-full px-4 py-2.5 transition-all cursor-pointer shadow-inner shadow-black/40"
        >
          <Sparkles className="w-4 h-4 text-blue-400 mr-2.5 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask stocks.ai anything"
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none cursor-pointer"
          />
          <div className="text-[10px] px-2 py-0.5 rounded-md bg-[#192237] text-gray-400 border border-[#232f4c] font-mono">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => { setBellOpen(!bellOpen); setUnread(false); }}
            className="relative p-2.5 rounded-full bg-[#101524] border border-[#1b243b] text-gray-400 hover:text-white hover:bg-[#161c2e] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unread && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#090d16]"></span>}
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0f1422] border border-[#1e2740] rounded-2xl shadow-2xl p-3 z-50 space-y-2">
              <p className="text-xs font-bold text-white px-1">Notifications</p>
              {[
                "Live quotes sync every 60 seconds.",
                "Add Finnhub / EODHD keys in Settings for premium feeds.",
                "Press ⌘K / Ctrl+K anytime to ask the AI search.",
              ].map((n) => (
                <p key={n} className="text-[11px] text-gray-300 bg-[#121828] border border-[#1a233a] rounded-xl px-3 py-2">{n}</p>
              ))}
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button
          onClick={onOpenSettingsAction}
          className="p-2.5 rounded-full bg-[#101524] border border-[#1b243b] text-gray-400 hover:text-white hover:bg-[#161c2e] transition-colors"
          title="Market API Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <AuthButton />
      </div>
    </header>
  );
}
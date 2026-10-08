"use client";

import React, { useState, useEffect } from "react";
import { X, Key, CheckCircle, Wifi, Globe, Shield, RefreshCw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onRefreshDataAction: () => void;
}

export default function SettingsModal({
  isOpen,
  onCloseAction,
  onRefreshDataAction,
}: SettingsModalProps) {
  const [eodhdKey, setEodhdKey] = useState("");
  const [ngnKey, setNgnKey] = useState("");
  const [finnhubKey, setFinnhubKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEodhdKey(localStorage.getItem("STOVEST_EODHD_KEY") || "");
      setNgnKey(localStorage.getItem("STOVEST_NGN_KEY") || "");
      setFinnhubKey(localStorage.getItem("STOVEST_FINNHUB_KEY") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("STOVEST_EODHD_KEY", eodhdKey.trim());
      localStorage.setItem("STOVEST_NGN_KEY", ngnKey.trim());
      localStorage.setItem("STOVEST_FINNHUB_KEY", finnhubKey.trim());
    }
    setSaved(true);
    onRefreshDataAction();
    setTimeout(() => {
      setSaved(false);
      onCloseAction();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e1320] border border-[#1e2840] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onCloseAction}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#141b2c] text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Market API Settings</h2>
            <p className="text-xs text-gray-400">
              Manage your real-time market data providers and API credentials
            </p>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="rounded-2xl bg-[#111624] border border-[#1a233a] p-4 mb-5 space-y-2.5">
          <span className="text-xs font-semibold text-gray-300 block mb-2">Active Data Pipelines:</span>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-300">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              Live Equities (US & South Africa JSE)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-bold">
              Active (Live)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Live African FX (NGN, ZAR, KES, EGP)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-bold">
              Active (Live)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-300">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Pan-African Financial News RSS
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-400 font-bold">
              Connected
            </span>
          </div>
        </div>

        {/* Custom API Keys Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              NGN Market API Key <span className="text-gray-500 font-normal">(Live Nigerian Exchange prices)</span>
            </label>
            <input
              type="password"
              value={ngnKey}
              onChange={(e) => setNgnKey(e.target.value)}
              placeholder="ngm_live_... (free key at ngnmarket.com)"
              className="w-full bg-[#121828] border border-[#1d273f] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              EODHD API Key <span className="text-gray-500 font-normal">(Optional, JSE listings)</span>
            </label>
            <input
              type="password"
              value={eodhdKey}
              onChange={(e) => setEodhdKey(e.target.value)}
              placeholder="e.g. 64a8b... (Leave blank to use default real-time feeds)"
              className="w-full bg-[#121828] border border-[#1d273f] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Live feed for Johannesburg (JSE) listings.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Finnhub API Key <span className="text-gray-500 font-normal">(Optional for WebSocket ticks)</span>
            </label>
            <input
              type="password"
              value={finnhubKey}
              onChange={(e) => setFinnhubKey(e.target.value)}
              placeholder="e.g. c8... (Leave blank to use default Yahoo Finance feed)"
              className="w-full bg-[#121828] border border-[#1d273f] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCloseAction}
              className="flex-1 py-2.5 rounded-xl bg-[#141b2c] text-gray-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saved}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Credentials Saved!
                </>
              ) : (
                "Save & Reconnect"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
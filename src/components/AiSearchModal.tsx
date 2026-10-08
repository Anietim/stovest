"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, ArrowRight, Bot, TrendingUp } from "lucide-react";

interface AiSearchModalProps {
  initialQuery?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
}

export default function AiSearchModal({
  initialQuery = "",
  isOpen,
  onClose,
  onSelectTicker,
}: AiSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "Top high-dividend stocks on the Nigerian Exchange (NGX)",
    "How does Naspers compare to US tech giants like Alphabet?",
    "Why is Safaricom M-Pesa a growth catalyst in East Africa?",
    "Best balanced portfolio allocation for African + US tech stocks",
  ];

  const handleRunPrompt = (promptText: string) => {
    setQuery(promptText);
    setLoading(true);
    setResponse(null);

    setTimeout(() => {
      setLoading(false);
      if (promptText.toLowerCase().includes("dividend") || promptText.toLowerCase().includes("ngx")) {
        setResponse(
          "On the Nigerian Exchange (NGX), leading dividend payers historically include **Dangote Cement (DANGCEM)**, **Zenith Bank (ZENITHBANK)**, and **GTCO**. They boast strong capital adequacy, double-digit dividend yields (often 8–14%), and steady cash-flow generation."
        );
      } else if (promptText.toLowerCase().includes("naspers")) {
        setResponse(
          "**Naspers (JSE: NPN)** is Africa's largest tech holding company. Its valuation is heavily anchored by its multi-billion-dollar indirect holding in **Tencent** via Prosus. While US giants like **Alphabet (GOOG)** focus on search and cloud, Naspers provides emerging market exposure across global consumer tech, food delivery, and payments."
        );
      } else if (promptText.toLowerCase().includes("safaricom")) {
        setResponse(
          "**Safaricom PLC (NSE: SCOM)** is Kenya's market leader. Over 40% of its operating profit originates from **M-Pesa**, which has expanded into Ethiopia and cross-border remittances with double-digit transaction velocity growth."
        );
      } else {
        setResponse(
          "A recommended hybrid portfolio for young African investors: **50% Global Tech ETFs / US Equities** (AAPL, MSFT, NVDA) for USD hedge and innovation upside, **30% Pan-African Blue Chips** (DANGCEM, MTNN, NPN) for local currency dividend yield, and **20% High-Yield Cash / Fixed Income**."
        );
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0c101b] border border-[#1e2740] rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#161e30]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                stocks.ai Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  African & Global Markets
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Ask questions about valuations, earnings, and cross-border investment trends
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#121828] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat / Content Area */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {/* Preset Prompts */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Suggested Inquiries:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleRunPrompt(p)}
                  className="text-left text-xs p-3 rounded-2xl bg-[#101524] hover:bg-[#151c2e] border border-[#1b233a] hover:border-blue-500/30 text-gray-300 hover:text-white transition-all flex items-start justify-between gap-2"
                >
                  <span>{p}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Output */}
          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#121828] border border-[#1b253d] animate-pulse">
              <Bot className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs text-gray-300">
                Analyzing market data from NGX, JSE, NSE, and US exchanges...
              </span>
            </div>
          )}

          {response && !loading && (
            <div className="p-4 rounded-2xl bg-[#121828] border border-blue-500/30 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <Bot className="w-4 h-4" />
                <span>stocks.ai Intelligence</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                {response}
              </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-[#161e30]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) handleRunPrompt(query);
            }}
            className="flex items-center gap-2 bg-[#121828] border border-[#1d273f] focus-within:border-blue-500 rounded-full px-4 py-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about African or Global stocks..."
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

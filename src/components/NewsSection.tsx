"use client";

import React, { useState, useEffect } from "react";
import { Newspaper, ExternalLink, Flame } from "lucide-react";
import { MARKET_NEWS } from "../data/mockData";
import { MarketNews } from "../types";

export default function NewsSection() {
  const [news, setNews] = useState<MarketNews[]>(MARKET_NEWS);
  const [isLiveNews, setIsLiveNews] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          setNews(data.news);
          setIsLiveNews(true);
        }
      })
      .catch((err) => console.warn("Using baseline news:", err));
  }, []);

  return (
    <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 shadow-card hover:border-[#202c47] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Newspaper className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Pan-African & Global Market News
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Flame className="w-3 h-3 text-emerald-400" />
          {isLiveNews ? "Real-Time RSS Feed" : "Live Feed"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url || "#"}
            target={item.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#111624] hover:bg-[#151c2e] border border-[#1a2338] hover:border-blue-500/30 transition-all flex flex-col justify-between group cursor-pointer block"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  {item.source}
                  {item.url && <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </span>
                <span>{item.time}</span>
              </div>
              <h4 className="text-xs font-semibold text-gray-200 group-hover:text-white leading-snug line-clamp-2">
                {item.title}
              </h4>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#172033]">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#182136] text-gray-400 font-medium">
                {item.category}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                {item.sentiment.toUpperCase()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

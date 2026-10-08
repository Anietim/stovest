"use client";

import React, { useState } from "react";
import { Users, MessageSquare, ThumbsUp, TrendingUp, Send } from "lucide-react";

interface Post {
  id: number;
  author: string;
  handle: string;
  ticker: string;
  text: string;
  likes: number;
  replies: number;
  liked: boolean;
}

const SEED: Post[] = [
  { id: 1, author: "Amara O.", handle: "@amara_lagos", ticker: "JMIA", text: "Jumia's logistics margins keep improving. Watching for a breakout above the 50-day average.", likes: 24, replies: 6, liked: false },
  { id: 2, author: "Thabo M.", handle: "@thabo_jhb", ticker: "GFI", text: "Gold miners look strong with the rand softening. Adding to my Gold Fields position on dips.", likes: 41, replies: 11, liked: false },
  { id: 3, author: "Wanjiru K.", handle: "@wanjiru_nbo", ticker: "NVDA", text: "Diversifying from NSE into US tech via fractional units. Anyone else balancing local and global?", likes: 18, replies: 9, liked: false },
];

export default function CommunityView({ onSelectTickerAction }: { onSelectTickerAction: (t: string) => void }) {
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [text, setText] = useState("");
  const [ticker, setTicker] = useState("AAPL");

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosts((p) => [
      { id: Date.now(), author: "Naya Rachel", handle: "@naya", ticker: ticker.toUpperCase().trim() || "AAPL", text: text.trim(), likes: 0, replies: 0, liked: false },
      ...p,
    ]);
    setText("");
  };

  const toggleLike = (id: number) =>
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> Investor Community
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Share ideas on African and global stocks. Posts here are local to this session.</p>
      </div>

      <form onSubmit={publish} className="rounded-3xl bg-[#0c101b] border border-[#172033] p-5 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Share an idea or ask the community..."
          className="w-full bg-[#101524] border border-[#1d273f] rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            maxLength={8}
            className="w-28 bg-[#101524] border border-[#1d273f] rounded-full px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500"
            aria-label="Ticker"
          />
          <button type="submit" disabled={!text.trim()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1868fe] text-white text-xs font-semibold disabled:opacity-40 hover:bg-blue-600 transition-colors">
            <Send className="w-3.5 h-3.5" /> Post
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-3xl bg-[#0c101b] border border-[#172033] p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-white">{p.author}</span>
                <span className="text-xs text-gray-500 ml-2">{p.handle}</span>
              </div>
              <button onClick={() => onSelectTickerAction(p.ticker)} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#162035] text-blue-400 border border-blue-500/30 hover:bg-[#1b2a47]">
                <TrendingUp className="w-3 h-3" /> {p.ticker}
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{p.text}</p>
            <div className="flex items-center gap-5 mt-3 text-[11px] text-gray-500">
              <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 transition-colors ${p.liked ? "text-blue-400" : "hover:text-gray-300"}`}>
                <ThumbsUp className="w-3.5 h-3.5" /> {p.likes}
              </button>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {p.replies}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

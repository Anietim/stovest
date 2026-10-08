"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/db";
import AuthModal from "./AuthModal";

// "Watch + email alert" control. Pro feature (enforced by the database too).
export default function WatchButton({ ticker, name, exchange }: { ticker: string; name?: string; exchange?: string }) {
  const { user, isPro } = useAuth();
  const [saved, setSaved] = useState(false);
  const [pct, setPct] = useState(3);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; upgrade?: boolean } | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return setSaved(false);
    getWatchlist().then(({ data }) => setSaved(data.some((r: any) => r.symbol === ticker)));
  }, [user, ticker]);

  const click = async () => {
    if (!user) return setAuthOpen(true);
    setBusy(true); setMsg(null);
    if (saved) {
      await removeFromWatchlist(ticker);
      setSaved(false);
    } else {
      const r = await addToWatchlist({ symbol: ticker, name, exchange }, user.id, pct);
      if (r.error) setMsg({ ok: false, text: r.error, upgrade: (r as any).needsPro });
      else { setSaved(true); setMsg({ ok: true, text: `We'll email you when ${ticker} moves ${pct}% or more.` }); }
    }
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={click} disabled={busy} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50 ${saved ? "bg-amber-950/40 border-amber-500/40 text-amber-400" : "bg-[#101524] border-[#1d273f] text-gray-200 hover:border-blue-500/50"}`}>
          <Star className={`w-4 h-4 ${saved ? "fill-amber-400" : ""}`} />
          {saved ? "Watching · email alerts on" : isPro || !user ? "Watch + email alerts" : "Watch + email alerts (Pro)"}
        </button>
        {!saved && (
          <select value={pct} onChange={(e) => setPct(Number(e.target.value))} className="bg-[#101524] border border-[#1d273f] rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none" title="Alert when price moves by">
            {[1, 3, 5, 10].map((v) => <option key={v} value={v}>±{v}%</option>)}
          </select>
        )}
      </div>
      {msg && (
        <p className={`text-[11px] font-semibold ${msg.ok ? "text-emerald-400" : "text-rose-400"}`}>
          {msg.text} {msg.upgrade && <Link href="/pricing" className="underline text-blue-400">Upgrade to Pro</Link>}
        </p>
      )}
      <AuthModal isOpen={authOpen} onCloseAction={() => setAuthOpen(false)} />
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

interface Props { isOpen: boolean; onCloseAction: () => void }

export default function AuthModal({ isOpen, onCloseAction }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseAction();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onCloseAction]);

  if (!isOpen || typeof document === "undefined") return null;

  const friendly = (m: string) =>
    /failed to fetch|network|fetch failed/i.test(m)
      ? "Cannot reach the server. Check your internet, turn off any VPN or ad-blocker, and try again."
      : m;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) {
      setMsg({ ok: false, text: "Supabase keys not loaded. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (project root), then restart npm run dev." });
      return;
    }
    setBusy(true); setMsg(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) setMsg({ ok: false, text: friendly(error.message) });
      else if (!data.session) setMsg({ ok: true, text: "Account created. Check your email to confirm, then log in." });
      else onCloseAction();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ ok: false, text: friendly(error.message) });
      else onCloseAction();
    }
    setBusy(false);
  };

  const input =
    "w-full bg-[#121828] border-2 border-[#232f4c] rounded-2xl px-4 py-3 text-sm font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";

  // Portal to <body>: escapes the header's blur/transform so it is never clipped
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/65 backdrop-blur-sm px-4 pt-[12vh] overflow-y-auto"
      onClick={onCloseAction}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-drop w-full max-w-md rounded-[28px] bg-[#0f1422] border-2 border-blue-500/50 shadow-[0_30px_80px_-10px_rgba(24,104,254,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="p-7 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-extrabold tracking-wider uppercase">
                <TrendingUp className="w-4 h-4" /> Stovest
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h3>
              <p className="text-sm font-medium text-gray-400 mt-1">
                {mode === "login" ? "Log in to see your portfolio." : "Track NGX, JSE & global stocks in one place."}
              </p>
            </div>
            <button onClick={onCloseAction} aria-label="Close" className="p-2 rounded-full bg-[#121828] text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <input className={input} required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input className={input} type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={input} type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
            {msg && (
              <p className={`text-sm font-bold ${msg.ok ? "text-emerald-400" : "text-rose-400"}`}>{msg.text}</p>
            )}
            <button
              disabled={busy}
              className="w-full py-3.5 rounded-2xl bg-[#1868fe] hover:bg-blue-500 text-white text-base font-extrabold shadow-lg shadow-blue-600/40 disabled:opacity-50 transition-colors"
            >
              {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}
            className="mt-5 text-sm font-bold text-blue-400 hover:text-blue-300"
          >
            {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
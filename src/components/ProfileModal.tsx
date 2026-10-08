"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

export default function ProfileModal({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
  const { user, profile, isPro, signOut } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!isOpen || !user || typeof document === "undefined") return null;
  const nameVal = name ?? profile?.full_name ?? "";
  const alertsVal = alerts ?? profile?.alerts_enabled ?? true;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameVal.trim();
    if (clean.length < 1 || clean.length > 60) return setMsg({ ok: false, text: "Name must be 1 to 60 characters." });
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("profiles").update({ full_name: clean, alerts_enabled: alertsVal }).eq("id", user.id);
    if (error) setMsg({ ok: false, text: "Could not save. Please try again." });
    else {
      await supabase.auth.updateUser({ data: { full_name: clean } });
      window.dispatchEvent(new Event("stovest-profile-updated"));
      setMsg({ ok: true, text: "Profile saved." });
      setName(null); setAlerts(null);
    }
    setBusy(false);
  };

  const input = "w-full bg-[#121828] border-2 border-[#232f4c] rounded-2xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-blue-500";

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/65 backdrop-blur-sm px-4 pt-[12vh] overflow-y-auto" onClick={onCloseAction}>
      <div className="animate-drop w-full max-w-md rounded-[28px] bg-[#0f1422] border-2 border-blue-500/50 shadow-[0_30px_80px_-10px_rgba(24,104,254,0.45)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <form onSubmit={save} className="p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Your profile</h3>
            <button type="button" onClick={onCloseAction} aria-label="Close" className="p-2 rounded-full bg-[#121828] text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1.5">Full name</label>
            <input className={input} value={nameVal} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1.5">Email (cannot be changed here)</label>
            <input className={`${input} opacity-60`} value={user.email || ""} readOnly />
          </div>

          <label className="flex items-center justify-between gap-3 bg-[#121828] border border-[#232f4c] rounded-2xl px-4 py-3 cursor-pointer">
            <span>
              <span className="block text-sm font-bold text-white">Email alerts</span>
              <span className="block text-[11px] text-gray-400">Stock movement alerts (Pro plan)</span>
            </span>
            <input type="checkbox" checked={alertsVal} onChange={(e) => setAlerts(e.target.checked)} className="w-5 h-5 accent-blue-600" />
          </label>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Plan: <b className={isPro ? "text-emerald-400" : "text-white"}>{isPro ? "Pro" : "Free"}</b>
              {isPro && profile?.plan_expires_at && <> · until {new Date(profile.plan_expires_at).toLocaleDateString()}</>}</span>
            <Link href="/pricing" className="font-bold text-blue-400 hover:text-blue-300">{isPro ? "Extend" : "Upgrade"} →</Link>
          </div>

          {msg && <p className={`text-sm font-bold ${msg.ok ? "text-emerald-400" : "text-rose-400"}`}>{msg.text}</p>}
          <div className="flex gap-3">
            <button disabled={busy} className="flex-1 py-3 rounded-2xl bg-[#1868fe] hover:bg-blue-500 text-white text-sm font-extrabold disabled:opacity-50">{busy ? "Saving..." : "Save changes"}</button>
            <button type="button" onClick={() => { signOut(); onCloseAction(); }} className="px-5 py-3 rounded-2xl bg-[#121828] border border-[#232f4c] text-gray-300 hover:text-white text-sm font-bold">Log out</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
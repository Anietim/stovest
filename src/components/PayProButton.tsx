"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "./AuthModal";

// Starts a Paystack checkout, and on return verifies the payment with the server.
export default function PayProButton({ returnTo, label = "Upgrade to Pro" }: { returnTo: string; label?: string }) {
  const { user, isPro, refreshProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const token = async () => (await supabase.auth.getSession()).data.session?.access_token;

  // Back from Paystack: ?reference=... -> verify -> upgrade
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (!ref || !user) return;
    (async () => {
      setMsg({ ok: true, text: "Confirming your payment..." });
      const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(ref)}`, {
        headers: { Authorization: `Bearer ${await token()}` },
      });
      const j = await res.json();
      if (j.ok) { setMsg({ ok: true, text: "Payment confirmed. You are now on Pro!" }); await refreshProfile(); }
      else setMsg({ ok: false, text: `Payment not completed (${j.status || j.error}).` });
      window.history.replaceState({}, "", window.location.pathname);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const pay = async () => {
    if (!user) return setAuthOpen(true);
    setBusy(true); setMsg(null);
    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ returnTo }),
    });
    const j = await res.json().catch(() => ({ error: `Server error (${res.status}). Open /api/paystack/check to see what is missing.` }));
    if (j.authorization_url) window.location.href = j.authorization_url;
    else { setMsg({ ok: false, text: j.error || "Could not start payment." }); setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <button onClick={pay} disabled={busy} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50">
        {busy ? "Redirecting to Paystack..." : isPro ? "Extend Pro by 30 days — ₦5,000" : `${label} — ₦5,000`}
      </button>
      {msg && <p className={`text-[11px] ${msg.ok ? "text-emerald-400" : "text-rose-400"}`}>{msg.text}</p>}
      <AuthModal isOpen={authOpen} onCloseAction={() => setAuthOpen(false)} />
    </div>
  );
}
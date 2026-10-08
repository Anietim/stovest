"use client";

import React, { useState } from "react";
import Link from "next/link";
import PayProButton from "@/components/PayProButton";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

// Dummy page to test the whole payment flow end to end (use Paystack TEST keys).
export default function PaystackTestPage() {
  const { user, profile, isPro, refreshProfile } = useAuth();
  const [note, setNote] = useState("");

  const reset = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const r = await fetch("/api/dev/reset-plan", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setNote(r.ok ? "Reset to Free." : "Reset failed (only works in dev).");
    await refreshProfile();
  };

  return (
    <main className="min-h-screen bg-[#070b13] text-white px-4 py-12">
      <div className="max-w-md mx-auto space-y-5">
        <Link href="/" className="text-xs text-blue-400">← Back to dashboard</Link>
        <h1 className="text-2xl font-extrabold">Paystack test page</h1>

        <div className="rounded-2xl bg-[#0c101b] border border-[#172033] p-4 text-xs space-y-1.5">
          <p><span className="text-gray-400">Logged in:</span> {user ? user.email : "no (use Log in on the pricing page first)"}</p>
          <p><span className="text-gray-400">Plan:</span> <b className={isPro ? "text-emerald-400" : ""}>{profile?.plan ?? "—"}</b></p>
          <p><span className="text-gray-400">Expires:</span> {profile?.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleString() : "—"}</p>
        </div>

        <PayProButton returnTo="/paystack-test" label="Pay ₦5,000 (test)" />

        <div className="rounded-2xl bg-[#0c101b] border border-[#172033] p-4 text-[11px] text-gray-300 space-y-1">
          <p className="font-bold text-white">Test card (test keys only)</p>
          <p>Card: 4084 0840 8408 4081 · CVV: 408 · Expiry: any future date</p>
          <p className="text-gray-500">If Paystack asks for a PIN or OTP, its test page shows the values to use. No real money moves.</p>
        </div>

        {user && <button onClick={reset} className="text-[11px] text-gray-400 hover:text-white underline">Reset my plan to Free (dev only)</button>}
        {note && <p className="text-[11px] text-emerald-400">{note}</p>}
      </div>
    </main>
  );
}

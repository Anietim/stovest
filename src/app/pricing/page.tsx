"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import PayProButton from "@/components/PayProButton";
import { useAuth } from "@/lib/useAuth";

const FREE = ["Live NGX, JSE & US prices", "Build your own portfolio", "Multi-currency view (NGN, ZAR, KES, USD)", "Market news"];
const PRO = ["Everything in Free", "Save stocks to your watchlist", "Email alerts when your watched stocks move"];

export default function PricingPage() {
  const { isPro, user } = useAuth();
  return (
    <main className="min-h-screen bg-[#070b13] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-xs text-blue-400 hover:text-blue-300">← Back to dashboard</Link>
        <h1 className="text-3xl font-extrabold mt-4 tracking-tight">Simple pricing</h1>
        <p className="text-sm text-gray-400 mt-1">Pay in naira with Paystack. Cancel anytime — Pro runs for 30 days per payment.</p>

        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          <div className="rounded-3xl bg-[#0c101b] border border-[#172033] p-6 flex flex-col">
            <h2 className="text-lg font-bold">Free</h2>
            <p className="text-3xl font-extrabold mt-2">₦0</p>
            <ul className="mt-5 space-y-2.5 text-xs text-gray-300 flex-1">
              {FREE.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-gray-500 shrink-0" />{f}</li>)}
            </ul>
            <div className="mt-6 text-center text-xs text-gray-500 py-2.5 rounded-xl bg-[#141b2c]">{user && !isPro ? "Your current plan" : "Included"}</div>
          </div>

          <div className="rounded-3xl bg-[#0c101b] border border-blue-500/50 p-6 flex flex-col shadow-lg shadow-blue-900/20">
            <h2 className="text-lg font-bold flex items-center gap-2">Pro <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600">Popular</span></h2>
            <p className="text-3xl font-extrabold mt-2">₦5,000<span className="text-sm font-medium text-gray-400"> / month</span></p>
            <ul className="mt-5 space-y-2.5 text-xs text-gray-300 flex-1">
              {PRO.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" />{f}</li>)}
            </ul>
            <div className="mt-6">{isPro && <p className="text-[11px] text-emerald-400 mb-2">You are on Pro.</p>}<PayProButton returnTo="/pricing" /></div>
          </div>
        </div>
      </div>
    </main>
  );
}

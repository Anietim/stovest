"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, Key, Mail, MessageCircle, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "@/components/AuthModal";

// Set these in .env.local (hidden if empty): NEXT_PUBLIC_SUPPORT_EMAIL, NEXT_PUBLIC_SUPPORT_WHATSAPP (digits, e.g. )
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";
const SUPPORT_WHATSAPP = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "").replace(/\D/g, "");

type Faq = { q: string; a: string; link?: { label: string; href: string } ; settings?: boolean };

const FAQ: Faq[] = [
  { q: "Where does the live data come from?", a: "Nigerian prices come from NGN Market (NGX, updated about every 20 minutes during trading hours). US and JSE prices come from Yahoo Finance, and exchange rates from Open ER-API. If a feed is unreachable the top banner shows Offline and sample data is used." },
  { q: "How do I add my data provider keys?", a: "Open Settings and add your NGN Market, Finnhub or EODHD key. Keys stay in your browser.", settings: true },
  { q: "How do I save a stock to my watchlist?", a: "Saving to a watchlist and stock-movement email alerts are part of the Pro plan (₦5,000 per month).", link: { label: "See pricing", href: "/pricing" } },
  { q: "My payment went through but I'm not on Pro", a: "Wait a minute and refresh. If it still shows Free, send us a message below with the Paystack reference from your receipt and choose the Payment category." },
  { q: "Can I switch currencies?", a: "Yes. Use the currency selector at the top to view values in USD, NGN, ZAR or KES." },
  { q: "Is this financial advice?", a: "No. Stovest is an informational tracker. Prices may be delayed and some sample data is illustrative. Do your own research before investing." },
];

const CATEGORIES = [
  { id: "general", label: "General question" },
  { id: "payment", label: "Payment / Pro plan" },
  { id: "data", label: "Wrong or missing data" },
  { id: "account", label: "Login / account" },
  { id: "bug", label: "Something is broken" },
];

interface Ticket { id: string; category: string; message: string; status: string; created_at: string }

export default function SupportView({ onOpenSettingsAction }: { onOpenSettingsAction: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState<number | null>(0);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [authOpen, setAuthOpen] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!user) return setTickets([]);
    const { data } = await supabase.from("support_tickets").select("id,category,message,status,created_at").order("created_at", { ascending: false }).limit(10);
    setTickets((data as Ticket[]) || []);
  }, [user]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setAuthOpen(true);
    setBusy(true); setNote(null);
    const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, email: user.email, category, message: message.trim() });
    if (error) setNote({ ok: false, text: error.message.includes("check") ? "Please write at least 10 characters." : "Could not send. Please try again." });
    else { setNote({ ok: true, text: "Message sent. We'll reply to your email." }); setMessage(""); loadTickets(); }
    setBusy(false);
  };

  const card = "rounded-3xl bg-[#0c101b] border border-[#172033]";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500" /> Help &amp; Support
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Quick answers, or send us a message and we'll get back to you.</p>
      </div>

      {/* FAQ */}
      <div className={`${card} divide-y divide-[#172033] overflow-hidden`}>
        {FAQ.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white hover:bg-[#101524]">
              {f.q}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed space-y-2">
                <p>{f.a}</p>
                {f.settings && <button onClick={onOpenSettingsAction} className="font-bold text-blue-400 hover:text-blue-300">Open Settings →</button>}
                {f.link && <Link href={f.link.href} className="font-bold text-blue-400 hover:text-blue-300">{f.link.label} →</Link>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact form */}
      <form onSubmit={send} className={`${card} p-5 space-y-3`}>
        <h3 className="text-sm font-bold text-white">Send us a message</h3>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#101524] border border-[#1d273f] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500">
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2000} required placeholder={user ? "Describe your issue (min 10 characters)..." : "Log in to send a message"} className="w-full bg-[#101524] border border-[#1d273f] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
        {note && <p className={`text-xs font-semibold flex items-center gap-1.5 ${note.ok ? "text-emerald-400" : "text-rose-400"}`}>{note.ok && <CheckCircle className="w-3.5 h-3.5" />}{note.text}</p>}
        <button disabled={busy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1868fe] hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50">
          <Send className="w-3.5 h-3.5" /> {user ? (busy ? "Sending..." : "Send message") : "Log in to send"}
        </button>
      </form>

      {/* Past tickets */}
      {user && tickets.length > 0 && (
        <div className={`${card} p-5 space-y-2.5`}>
          <h3 className="text-sm font-bold text-white">Your messages</h3>
          {tickets.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 text-xs bg-[#101524] border border-[#1a2338] rounded-xl px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-gray-200 truncate">{t.message}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{CATEGORIES.find((c) => c.id === t.category)?.label} · {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.status === "open" ? "text-amber-400 border-amber-500/30" : "text-emerald-400 border-emerald-500/30"}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Direct contact (only shown when configured in .env.local) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={onOpenSettingsAction} className={`${card} flex items-center gap-3 p-4 hover:border-blue-500/40 text-left transition-colors`}>
          <Key className="w-5 h-5 text-blue-400" />
          <div><p className="text-sm font-semibold text-white">API settings</p><p className="text-[11px] text-gray-400">Data provider keys</p></div>
        </button>
        {SUPPORT_WHATSAPP && (
          <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Hello Stovest support, I need help with...")}`} target="_blank" rel="noopener noreferrer" className={`${card} flex items-center gap-3 p-4 hover:border-emerald-500/40 transition-colors`}>
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <div><p className="text-sm font-semibold text-white">WhatsApp</p><p className="text-[11px] text-gray-400">Chat with us</p></div>
          </a>
        )}
        {SUPPORT_EMAIL && (
          <a href={`mailto:${SUPPORT_EMAIL}`} className={`${card} flex items-center gap-3 p-4 hover:border-blue-500/40 transition-colors`}>
            <Mail className="w-5 h-5 text-blue-400" />
            <div><p className="text-sm font-semibold text-white">Email</p><p className="text-[11px] text-gray-400 truncate">{SUPPORT_EMAIL}</p></div>
          </a>
        )}
      </div>
      <AuthModal isOpen={authOpen} onCloseAction={() => setAuthOpen(false)} />
    </div>
  );
}
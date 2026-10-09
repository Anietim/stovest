"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "./AuthModal";
import ProfileModal from "./ProfileModal";
import ThemeToggle from "./ThemeToggle";

// Header control: theme switch, then Log in (signed out) or a name-only profile pill (signed in)
export default function AuthButton() {
  const { user, profile, isPro, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Minimised state is remembered; phones start minimised
  useEffect(() => {
    try {
      const v = localStorage.getItem("stovest-profile-collapsed");
      setCollapsed(v === null ? window.innerWidth < 640 : v === "1");
    } catch {}
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("stovest-profile-collapsed", next ? "1" : "0"); } catch {}
  };

  const displayName = profile?.full_name?.trim() || "My account"; // never show the email here
  const initials =
    profile?.full_name?.trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("") || "U";

  return (
    <>
      <ThemeToggle />
      {loading ? null : user && collapsed ? (
        <div className="flex items-center gap-1">
          <button onClick={() => setProfileOpen(true)} title="Edit profile" className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500">
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center font-bold text-[11px] text-white uppercase">{initials}</div>
          </button>
          <button onClick={toggleCollapsed} title="Expand" aria-label="Expand profile" className="p-1.5 rounded-full text-gray-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      ) : user ? (
        <div className="flex items-center gap-2.5 bg-[#0f1422] border border-[#1b243b] rounded-full pl-1.5 pr-3 py-1">
          <button onClick={() => setProfileOpen(true)} title="Edit profile" className="flex items-center gap-2.5 rounded-full">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center font-bold text-[11px] text-white uppercase">{initials}</div>
            </div>
            <span className="hidden sm:block text-sm font-bold text-white max-w-[130px] truncate">{displayName}</span>
          </button>
          <Link href="/pricing" className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPro ? "bg-emerald-950/70 border-emerald-500/30 text-emerald-400" : "bg-[#141b2c] border-[#212c45] text-gray-300 hover:text-white"}`}>
            {isPro ? "PRO" : "Upgrade"}
          </Link>
          <button onClick={toggleCollapsed} title="Minimise" aria-label="Minimise profile" className="text-gray-500 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="hidden sm:inline text-[11px] text-gray-400 hover:text-white">Pricing</Link>
          <button onClick={() => setAuthOpen(true)} className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Log in</button>
        </div>
      )}
      <AuthModal isOpen={authOpen} onCloseAction={() => setAuthOpen(false)} />
      <ProfileModal isOpen={profileOpen} onCloseAction={() => setProfileOpen(false)} />
    </>
  );
}
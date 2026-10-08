"use client";

import React, { useState } from "react";
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

  const displayName = profile?.full_name?.trim() || "My account"; // never show the email here
  const initials =
    profile?.full_name?.trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("") || "U";

  return (
    <>
      <ThemeToggle />
      {loading ? null : user ? (
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
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="text-[11px] text-gray-400 hover:text-white">Pricing</Link>
          <button onClick={() => setAuthOpen(true)} className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Log in</button>
        </div>
      )}
      <AuthModal isOpen={authOpen} onCloseAction={() => setAuthOpen(false)} />
      <ProfileModal isOpen={profileOpen} onCloseAction={() => setProfileOpen(false)} />
    </>
  );
}
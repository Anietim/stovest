"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: "free" | "pro";
  plan_expires_at: string | null;
  alerts_enabled: boolean;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id,email,full_name,plan,plan_expires_at,alerts_enabled")
      .eq("id", uid)
      .maybeSingle();
    setProfile((data as Profile) || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // defer: calling supabase inside this callback can deadlock
      setTimeout(() => (s ? loadProfile(s.user.id) : setProfile(null)), 0);
    });
    const onUpdated = () =>
      supabase.auth.getSession().then(({ data }) => data.session && loadProfile(data.session.user.id));
    window.addEventListener("stovest-profile-updated", onUpdated);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("stovest-profile-updated", onUpdated);
    };
  }, [loadProfile]);

  const isPro =
    profile?.plan === "pro" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  return {
    session,
    user: session?.user ?? null,
    profile,
    isPro,
    loading,
    refreshProfile: () => (session ? loadProfile(session.user.id) : Promise.resolve()),
    signOut: () => supabase.auth.signOut(),
  };
}
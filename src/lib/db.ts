import { supabase } from "./supabase";

export interface StockRef { symbol: string; name?: string; exchange?: string }

// ---- Watchlist (Pro only: the database enforces this) ----
export async function getWatchlist() {
  const { data, error } = await supabase.from("watchlist").select("*").order("created_at", { ascending: false });
  return { data: data || [], error };
}
export async function addToWatchlist(s: StockRef, userId: string, thresholdPct = 3) {
  const { error } = await supabase.from("watchlist").insert({ user_id: userId, symbol: s.symbol, name: s.name, exchange: s.exchange, alert_threshold_pct: thresholdPct });
  if (error?.code === "42501") return { error: "Saving to your watchlist needs the Pro plan.", needsPro: true };
  if (error?.code === "23505") return { error: "Already in your watchlist." };
  return { error: error?.message };
}
export const removeFromWatchlist = (symbol: string) => supabase.from("watchlist").delete().eq("symbol", symbol);

// ---- Holdings / portfolio (free for every user) ----
export async function getHoldings() {
  const { data, error } = await supabase.from("holdings").select("*").order("created_at", { ascending: false });
  return { data: data || [], error };
}
export async function saveHolding(s: StockRef & { units: number; avg_cost_usd?: number }, userId: string) {
  const { error } = await supabase.from("holdings").upsert(
    { user_id: userId, symbol: s.symbol, name: s.name, exchange: s.exchange, units: s.units, avg_cost_usd: s.avg_cost_usd ?? 0, updated_at: new Date().toISOString() },
    { onConflict: "user_id,symbol" }
  );
  return { error: error?.message };
}
export const removeHolding = (symbol: string) => supabase.from("holdings").delete().eq("symbol", symbol);
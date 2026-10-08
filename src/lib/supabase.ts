import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// false when .env.local is missing/not loaded (the app would otherwise call a fake address and show "Failed to fetch")
export const supabaseConfigured = Boolean(url && key);

// Browser client: uses only the PUBLIC (publishable) key. Row-level security protects the data.
export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder-key");
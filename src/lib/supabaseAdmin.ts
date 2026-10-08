import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the secret service-role key; never import this from a "use client" file.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getUserFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data } = await supabaseAdmin().auth.getUser(token);
  return data?.user ?? null;
}

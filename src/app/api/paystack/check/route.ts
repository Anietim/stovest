import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Dev-only setup check: open http://localhost:3000/api/paystack/check
// Shows WHICH key is missing/wrong. Never prints the key values.
export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Disabled" }, { status: 403 });
  const out: Record<string, string> = {};
  out.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "MISSING";
  out.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "ok" : "MISSING";
  out.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "MISSING";
  const pk = process.env.PAYSTACK_SECRET_KEY;
  out.PAYSTACK_SECRET_KEY = !pk ? "MISSING" : pk.startsWith("sk_test_") ? "ok (test mode)" : pk.startsWith("sk_live_") ? "ok (LIVE mode)" : "WRONG FORMAT - must start with sk_test_ (not pk_test_)";
  try {
    const { error } = await supabaseAdmin().from("payments").select("id").limit(1);
    out.database_access = error ? `FAIL: ${error.message}` : "ok";
  } catch (e: any) {
    out.database_access = `FAIL: ${e.message}`;
  }
  if (pk) {
    try {
      const r = await fetch("https://api.paystack.co/balance", { headers: { Authorization: `Bearer ${pk}` }, cache: "no-store" });
      out.paystack_login = r.ok ? "ok" : `FAIL (${r.status}) - key is wrong or from another account`;
    } catch {
      out.paystack_login = "FAIL: cannot reach Paystack (internet/firewall)";
    }
  }
  return NextResponse.json(out, { status: 200 });
}
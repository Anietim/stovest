import { NextResponse } from "next/server";
import { supabaseAdmin, getUserFromRequest } from "@/lib/supabaseAdmin";
import { PRO_PRICE_KOBO, ALLOWED_RETURN_PATHS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (e: any) {
    console.error("Paystack initialize failed:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

async function handle(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || !user.email) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "PAYSTACK_SECRET_KEY is not set on the server." }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const returnTo = ALLOWED_RETURN_PATHS.includes(body?.returnTo) ? body.returnTo : "/pricing";
  const reference = `stv_${user.id.slice(0, 8)}_${Date.now()}`;

  const { error: insErr } = await supabaseAdmin().from("payments").insert({
    user_id: user.id, reference, amount_kobo: PRO_PRICE_KOBO, status: "pending",
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      amount: PRO_PRICE_KOBO,
      currency: "NGN",
      reference,
      callback_url: `${new URL(req.url).origin}${returnTo}`,
      metadata: { user_id: user.id, plan: "pro" },
    }),
  });
  const json = await res.json();
  if (!json?.status) return NextResponse.json({ error: json?.message || "Paystack error" }, { status: 502 });
  return NextResponse.json({ authorization_url: json.data.authorization_url, reference });
}
import { supabaseAdmin } from "./supabaseAdmin";
import { PRO_PRICE_KOBO, PRO_DAYS } from "./plans";

// Verifies a payment directly with Paystack (never trusts the browser), then upgrades the user.
export async function activatePro(reference: string, onlyForUserId?: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false, status: "server_not_configured" };

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" }
  );
  const json = await res.json();
  const d = json?.data;
  if (!json?.status || d?.status !== "success") return { ok: false, status: d?.status || "not_paid" };
  if (d.amount !== PRO_PRICE_KOBO || d.currency !== "NGN") return { ok: false, status: "amount_mismatch" };

  const admin = supabaseAdmin();
  const { data: pay } = await admin.from("payments").select("user_id,status").eq("reference", reference).maybeSingle();
  if (!pay) return { ok: false, status: "unknown_reference" };
  if (onlyForUserId && pay.user_id !== onlyForUserId) return { ok: false, status: "forbidden" };
  if (pay.status === "success") return { ok: true, already: true };

  // Only the first caller flips pending -> success (webhook and redirect can race)
  const { data: flipped } = await admin
    .from("payments")
    .update({ status: "success", paid_at: new Date().toISOString() })
    .eq("reference", reference)
    .neq("status", "success")
    .select("id");
  if (!flipped?.length) return { ok: true, already: true };

  const { data: prof } = await admin.from("profiles").select("plan_expires_at").eq("id", pay.user_id).single();
  const start = prof?.plan_expires_at && new Date(prof.plan_expires_at) > new Date() ? new Date(prof.plan_expires_at) : new Date();
  start.setDate(start.getDate() + PRO_DAYS);
  await admin.from("profiles").update({ plan: "pro", plan_expires_at: start.toISOString() }).eq("id", pay.user_id);
  return { ok: true };
}

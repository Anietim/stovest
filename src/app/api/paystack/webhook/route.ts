import { NextResponse } from "next/server";
import crypto from "crypto";
import { activatePro } from "@/lib/activatePro";

export const dynamic = "force-dynamic";

// Set this URL in Paystack dashboard > Settings > API Keys & Webhooks
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const sig = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (!secret || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const event = JSON.parse(raw);
  if (event?.event === "charge.success" && event?.data?.reference) {
    await activatePro(event.data.reference);
  }
  return NextResponse.json({ received: true });
}

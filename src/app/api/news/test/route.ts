import { NextResponse } from "next/server";
import { supabaseAdmin, getUserFromRequest } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// TEST HELPER: puts you back on Free so you can retest payment. Disabled in production.
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Disabled" }, { status: 403 });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  await supabaseAdmin().from("profiles").update({ plan: "free", plan_expires_at: null }).eq("id", user.id);
  return NextResponse.json({ ok: true });
}

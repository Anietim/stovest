import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabaseAdmin";
import { activatePro } from "@/lib/activatePro";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  return NextResponse.json(await activatePro(reference, user.id));
}

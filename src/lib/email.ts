// Sends email through Resend (free tier). Needs RESEND_API_KEY and ALERTS_FROM_EMAIL.
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERTS_FROM_EMAIL;
  if (!key || !from) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!r.ok) console.error("Resend error:", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("Resend failed:", e);
    return false;
  }
}
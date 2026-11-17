import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Find the first string value under any of the given keys, searching the payload recursively.
function find(obj: any, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    if (keys.includes(k.toLowerCase()) && typeof obj[k] === "string") return obj[k];
  }
  for (const k of Object.keys(obj)) {
    const r = find(obj[k], keys);
    if (r) return r;
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (!process.env.SELAR_WEBHOOK_SECRET || url.searchParams.get("secret") !== process.env.SELAR_WEBHOOK_SECRET)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const raw = JSON.stringify(body).toLowerCase();

  const plan = raw.includes("97plan") ? "pro" : raw.includes("47plan") ? "starter" : null;
  const email = find(body, ["email", "customer_email", "buyer_email"])?.toLowerCase().trim();
  if (!plan || !email) {
    console.warn("Selar webhook: could not read plan/email", raw.slice(0, 500));
    return NextResponse.json({ ok: false, reason: "unrecognised payload" }, { status: 200 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  let userId: string | undefined;
  for (let page = 1; page <= 20 && !userId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    const users: any[] = (data as any)?.users ?? [];
    if (error || !users.length) break;
    userId = users.find((u) => u.email?.toLowerCase() === email)?.id;
  }
  if (!userId) {
    console.warn("Selar webhook: no account for", email);
    return NextResponse.json({ ok: false, reason: "no matching account" }, { status: 200 });
  }

  const { error } = await admin.from("organizations").update({ plan }).eq("owner_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, plan });
}

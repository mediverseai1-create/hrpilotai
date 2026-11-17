import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(url, key);

export async function callAI(task: string, payload: any) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token ?? ""}`,
    },
    body: JSON.stringify({ task, payload }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "AI request failed");
  return json.text as string;
}

export const PAYMENT_LINKS = {
  starter: process.env.NEXT_PUBLIC_PAYMENT_LINK_STARTER || "#",
  pro: process.env.NEXT_PUBLIC_PAYMENT_LINK_PRO || "#",
};

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { supabase, callAI } from "@/lib/supabase";

export default function Assistant() {
  const [docs, setDocs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase.from("knowledge").select("title,content").then(({ data }) => setDocs(data || [])); }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const knowledge = docs.map((d) => `# ${d.title}\n${d.content}`).join("\n\n").slice(0, 60000);
    try { const a = await callAI("assistant", { knowledge, question: q }); setChat([{ q, a }, ...chat]); setQ(""); }
    catch (e: any) { setChat([{ q, a: e.message }, ...chat]); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">HR Assistant</h1><p className="mt-1 text-sm text-gray-500">Ask anything — answers come only from your own company knowledge.</p></div>
      {docs.length === 0 && <p className="panel text-sm text-gray-600">No policies yet. <Link className="font-semibold underline" href="/dashboard/knowledge">Add company knowledge</Link> so the assistant has something to ground its answers in.</p>}
      <form onSubmit={ask} className="panel flex gap-3 !p-4"><input className="field" required placeholder="e.g. How many days of annual leave do staff get?" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn-accent" disabled={busy}><Send size={16} />{busy ? "…" : "Ask"}</button></form>
      {chat.map((c, i) => (<div key={i} className="panel"><p className="font-semibold">{c.q}</p><p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{c.a}</p></div>))}
    </div>
  );
}

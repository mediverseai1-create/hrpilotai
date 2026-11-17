"use client";
import { useEffect, useState } from "react";
import { supabase, callAI } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Assistant() {
  const org = useOrg();
  const [docs, setDocs] = useState<any[]>([]);
  const [t, setT] = useState({ title: "", content: "" });
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() { const { data } = await supabase.from("knowledge").select("*").order("created_at", { ascending: false }); setDocs(data || []); }
  useEffect(() => { load(); }, []);

  async function addDoc(e: React.FormEvent) { e.preventDefault(); const { error } = await supabase.from("knowledge").insert({ ...t, org_id: org.id }); if (error) return alert(error.message); setT({ title: "", content: "" }); load(); }
  async function upload(file: File) { setT({ title: file.name, content: await file.text() }); }

  async function ask(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const knowledge = docs.map((d) => `# ${d.title}\n${d.content}`).join("\n\n").slice(0, 60000);
    try { const a = await callAI("assistant", { knowledge, question: q }); setChat([{ q, a }, ...chat]); setQ(""); } catch (e: any) { alert(e.message); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Company knowledge & assistant</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addDoc} className="card space-y-3">
          <h2 className="font-semibold">Add a policy</h2>
          <input className="input" required placeholder="Title" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} />
          <textarea className="input h-32" required placeholder="Paste policy text (or upload a .txt/.md file)" value={t.content} onChange={(e) => setT({ ...t, content: e.target.value })} />
          <input type="file" accept=".txt,.md" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button className="btn-primary">Save</button>
          <ul className="space-y-1 text-sm text-gray-600">{docs.map((d) => <li key={d.id}>• {d.title}</li>)}</ul>
        </form>
        <div className="space-y-3">
          <form onSubmit={ask} className="card flex gap-2"><input className="input" required placeholder="Ask about your policies…" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn-primary" disabled={busy}>{busy ? "…" : "Ask"}</button></form>
          {chat.map((c, i) => (<div key={i} className="card"><p className="text-sm font-semibold">{c.q}</p><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{c.a}</p></div>))}
        </div>
      </div>
    </div>
  );
}

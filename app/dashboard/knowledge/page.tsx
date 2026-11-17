"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Knowledge() {
  const org = useOrg();
  const [docs, setDocs] = useState<any[]>([]);
  const [t, setT] = useState({ title: "", content: "" });

  async function load() { const { data } = await supabase.from("knowledge").select("*").order("created_at", { ascending: false }); setDocs(data || []); }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) { e.preventDefault(); const { error } = await supabase.from("knowledge").insert({ ...t, org_id: org.id }); if (error) return alert(error.message); setT({ title: "", content: "" }); load(); }
  async function del(id: string) { if (confirm("Delete this document?")) { await supabase.from("knowledge").delete().eq("id", id); load(); } }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Company Knowledge</h1><p className="mt-1 text-sm text-gray-500">Upload your policies once. The HR Assistant answers from these documents.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={add} className="panel h-fit space-y-4">
          <h2 className="font-semibold">Add a policy</h2>
          <div><label className="flabel">Title</label><input className="field" required placeholder="Leave policy" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></div>
          <div><label className="flabel">Content</label><textarea className="field h-40" required placeholder="Paste policy text…" value={t.content} onChange={(e) => setT({ ...t, content: e.target.value })} /></div>
          <input type="file" accept=".txt,.md" className="text-sm" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setT({ title: f.name.replace(/\.\w+$/, ""), content: await f.text() }); }} />
          <button className="btn-accent w-full">Save document</button>
        </form>
        <div className="panel">
          <h2 className="font-semibold">Documents ({docs.length})</h2>
          {docs.length === 0 ? <p className="mt-4 text-sm text-gray-500">Nothing uploaded yet.</p> : (
            <ul className="mt-3 divide-y divide-black/5 text-sm">{docs.map((d) => (<li key={d.id} className="flex items-center justify-between py-3"><span>{d.title}</span><button onClick={() => del(d.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></li>))}</ul>)}
        </div>
      </div>
    </div>
  );
}

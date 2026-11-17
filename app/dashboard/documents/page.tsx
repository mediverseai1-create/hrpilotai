"use client";
import { useEffect, useState } from "react";
import { supabase, callAI } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Documents() {
  const org = useOrg();
  const [emps, setEmps] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [f, setF] = useState({ employee_id: "", type: "warning letter", facts: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ data: e }, { data: d }] = await Promise.all([supabase.from("employees").select("*"), supabase.from("documents").select("*").order("created_at", { ascending: false })]);
    setEmps(e || []); setDocs(d || []);
  }
  useEffect(() => { load(); }, []);

  async function draft(e: React.FormEvent) {
    e.preventDefault();
    if (org.plan !== "pro") return alert("The AI writing assistant is a Pro feature. Upgrade in Billing.");
    setBusy(true);
    try {
      const emp = emps.find((x) => x.id === f.employee_id);
      const { data: att } = await supabase.from("attendance").select("day").eq("employee_id", f.employee_id).order("day", { ascending: false }).limit(30);
      const content = await callAI("document", { type: f.type, facts: f.facts, records: { employee: emp, recentAttendanceDays: att?.map((a: any) => a.day) } });
      await supabase.from("documents").insert({ org_id: org.id, employee_id: f.employee_id || null, type: f.type, content });
      setF({ ...f, facts: "" });
    } catch (e: any) { alert(e.message); }
    setBusy(false); load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">HR documents</h1>
      <form onSubmit={draft} className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="input" required value={f.employee_id} onChange={(e) => setF({ ...f, employee_id: e.target.value })}><option value="">Select employee</option>{emps.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["query letter", "warning letter", "reference letter", "offer letter", "termination notice"].map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <textarea className="input h-24" required placeholder="What happened? e.g. Late three times this week without notice." value={f.facts} onChange={(e) => setF({ ...f, facts: e.target.value })} />
        <button className="btn-primary" disabled={busy}>{busy ? "Drafting…" : "Draft for review"}</button>
        <p className="text-xs text-gray-500">AI drafts are for your review. A person must approve every disciplinary or termination decision.</p>
      </form>
      {docs.map((d) => (<div key={d.id} className="card"><p className="text-xs uppercase text-brand-700">{d.type} · {emps.find((e) => e.id === d.employee_id)?.name}</p><pre className="mt-2 whitespace-pre-wrap font-sans text-sm">{d.content}</pre></div>))}
    </div>
  );
}

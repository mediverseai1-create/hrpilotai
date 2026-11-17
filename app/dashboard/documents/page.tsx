"use client";
import { useEffect, useState } from "react";
import { Sparkles, Copy } from "lucide-react";
import { supabase, callAI } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

const TYPES = ["Query letter", "Warning letter", "Reference letter", "Offer letter", "Termination notice"];
const TONES = ["Firm", "Formal", "Friendly", "Neutral"];

export default function Documents() {
  const org = useOrg();
  const [emps, setEmps] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [f, setF] = useState({ employee_id: "", type: TYPES[0], tone: TONES[0], facts: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const [{ data: e }, { data: d }] = await Promise.all([
      supabase.from("employees").select("*").order("name"),
      supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    setEmps(e || []); setDocs(d || []);
  }
  useEffect(() => { load(); }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (org.plan !== "pro") return setErr("The AI writing assistant is a Pro feature. Upgrade from the Upgrade button above.");
    setBusy(true);
    try {
      const emp = emps.find((x) => x.id === f.employee_id);
      const { data: att } = await supabase.from("attendance").select("day").eq("employee_id", f.employee_id).order("day", { ascending: false }).limit(30);
      const content = await callAI("document", { type: f.type.toLowerCase(), tone: f.tone.toLowerCase(), facts: f.facts, records: { employee: emp, recentAttendanceDays: att?.map((a: any) => a.day) } });
      setDraft(content);
      await supabase.from("documents").insert({ org_id: org.id, employee_id: f.employee_id, type: f.type, content });
      load();
    } catch (e: any) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Documents</h1><p className="mt-1 text-sm text-gray-500">Create an HR letter grounded in what actually happened.</p></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={generate} className="panel h-fit space-y-4">
          <h2 className="font-semibold">Letter details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="flabel">Document type</label><select className="field" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="flabel">Tone</label><select className="field" value={f.tone} onChange={(e) => setF({ ...f, tone: e.target.value })}>{TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label className="flabel">Employee</label><select className="field" required value={f.employee_id} onChange={(e) => setF({ ...f, employee_id: e.target.value })}><option value="">Select employee</option>{emps.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
          <div><label className="flabel">What happened?</label><textarea className="field h-28" required placeholder="e.g. Arrived late four times this week, most recently at 8:27am on Monday." value={f.facts} onChange={(e) => setF({ ...f, facts: e.target.value })} />
            <p className="mt-1 text-xs text-gray-500">Be specific — the letter is generated only from what you describe here.</p></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-accent w-full" disabled={busy}><Sparkles size={16} />{busy ? "Generating…" : "Generate draft"}</button>
        </form>

        <div className="space-y-5">
          <div className="panel min-h-[14rem]">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Draft</h2>{draft && <button className="text-gray-500" onClick={() => navigator.clipboard.writeText(draft)}><Copy size={16} /></button>}</div>
            {draft ? <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-gray-800">{draft}</pre> : <p className="mt-4 text-sm text-gray-400">Fill in the form and generate a draft to preview it here.</p>}
          </div>
          <div className="panel">
            <h2 className="font-semibold">Recent documents</h2>
            {docs.length === 0 ? <p className="mt-4 text-sm text-gray-500">No drafts yet.</p> : (
              <ul className="mt-3 divide-y divide-black/5 text-sm">{docs.map((d) => (
                <li key={d.id}><button className="flex w-full justify-between py-2.5 text-left hover:text-brand-700" onClick={() => setDraft(d.content)}>
                  <span>{d.type} · {emps.find((e) => e.id === d.employee_id)?.name ?? "—"}</span><span className="text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span></button></li>))}</ul>)}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">AI drafts are for your review. A person must approve every disciplinary or termination decision.</p>
    </div>
  );
}

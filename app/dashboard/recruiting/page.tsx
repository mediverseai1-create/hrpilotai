"use client";
import { useEffect, useState } from "react";
import { supabase, callAI } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Recruiting() {
  const org = useOrg();
  const [jobs, setJobs] = useState<any[]>([]);
  const [cands, setCands] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [request, setRequest] = useState("");
  const [title, setTitle] = useState("");
  const [cand, setCand] = useState({ name: "", email: "", resume: "" });
  const [busy, setBusy] = useState("");

  async function load() {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    if (sel) { const { data: c } = await supabase.from("candidates").select("*").eq("job_id", sel.id).order("score", { ascending: false, nullsFirst: false }); setCands(c || []); }
  }
  useEffect(() => { load(); }, [sel]);

  async function createJob(e: React.FormEvent) {
    e.preventDefault(); setBusy("job");
    try {
      const posting = await callAI("job_post", { request });
      const { data, error } = await supabase.from("jobs").insert({ org_id: org.id, title, request, posting, requirements: request }).select().single();
      if (error) throw error;
      setRequest(""); setTitle(""); setSel(data);
    } catch (e: any) { alert(e.message); }
    setBusy(""); load();
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault(); setBusy("cand");
    try {
      const raw = await callAI("screen", { title: sel.title, requirements: sel.requirements, resume: cand.resume });
      let r: any = {};
      try { r = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { r = { score: null, summary: raw }; }
      const summary = [r.summary, r.strengths?.length ? "Strengths: " + r.strengths.join("; ") : "", r.gaps?.length ? "Gaps: " + r.gaps.join("; ") : ""].filter(Boolean).join("\n");
      const { error } = await supabase.from("candidates").insert({ org_id: org.id, job_id: sel.id, ...cand, score: r.score, summary });
      if (error) throw error;
      setCand({ name: "", email: "", resume: "" });
    } catch (e: any) { alert(e.message); }
    setBusy(""); load();
  }

  async function brief(c: any) {
    setBusy(c.id);
    try {
      const b = await callAI("interview", { title: sel.title, requirements: sel.requirements, summary: c.summary });
      await supabase.from("candidates").update({ brief: b }).eq("id", c.id);
    } catch (e: any) { alert(e.message); }
    setBusy(""); load();
  }

  async function stage(c: any, stage: string) { await supabase.from("candidates").update({ stage }).eq("id", c.id); load(); }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recruiting Agent</h1>
      <form onSubmit={createJob} className="card space-y-3">
        <h2 className="font-semibold">Describe who you need to hire</h2>
        <input className="input" required placeholder="Role title, e.g. Product Designer" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input h-24" required placeholder="We need a designer with 3+ years in SaaS, strong Figma skills, remote-friendly…" value={request} onChange={(e) => setRequest(e.target.value)} />
        <button className="btn-primary" disabled={busy === "job"}>{busy === "job" ? "Drafting posting…" : "Create role & posting"}</button>
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          {jobs.map((j) => (<button key={j.id} onClick={() => setSel(j)} className={`card w-full text-left ${sel?.id === j.id ? "!border-brand-500" : ""}`}><p className="font-semibold">{j.title}</p><p className="text-xs text-gray-500">{j.status}</p></button>))}
          {!jobs.length && <p className="text-sm text-gray-500">No roles yet.</p>}
        </div>
        <div className="space-y-4 lg:col-span-2">
          {sel && (<>
            <div className="card"><h2 className="font-semibold">{sel.title} — posting</h2><pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-gray-700">{sel.posting}</pre></div>
            <form onSubmit={addCandidate} className="card space-y-3">
              <h2 className="font-semibold">Add & screen candidate</h2>
              <div className="grid gap-3 sm:grid-cols-2"><input className="input" required placeholder="Name" value={cand.name} onChange={(e) => setCand({ ...cand, name: e.target.value })} /><input className="input" placeholder="Email" value={cand.email} onChange={(e) => setCand({ ...cand, email: e.target.value })} /></div>
              <textarea className="input h-28" required placeholder="Paste resume text" value={cand.resume} onChange={(e) => setCand({ ...cand, resume: e.target.value })} />
              <button className="btn-primary" disabled={busy === "cand"}>{busy === "cand" ? "Screening…" : "Screen with AI"}</button>
            </form>
            {cands.map((c) => (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between"><p className="font-semibold">{c.name}</p><span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-800">{c.score ?? "–"}</span></div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{c.summary}</p>
                {c.brief && <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-brand-50 p-3 font-sans text-sm">{c.brief}</pre>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-ghost !py-1.5" onClick={() => brief(c)} disabled={busy === c.id}>{busy === c.id ? "Preparing…" : "Interview brief"}</button>
                  <select className="input !w-auto" value={c.stage} onChange={(e) => stage(c, e.target.value)}>{["applied", "screened", "interview", "offer", "hired", "rejected"].map((s) => <option key={s}>{s}</option>)}</select>
                </div>
              </div>
            ))}
          </>)}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { supabase, callAI } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Overview() {
  const org = useOrg();
  const [s, setS] = useState({ employees: 0, openJobs: 0, candidates: 0, present: 0 });
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const c = (t: string, f?: (q: any) => any) => { let q = supabase.from(t).select("id", { count: "exact", head: true }); return (f ? f(q) : q).then((r: any) => r.count ?? 0); };
      const [employees, openJobs, candidates, present] = await Promise.all([
        c("employees"), c("jobs", (q) => q.eq("status", "open")), c("candidates"), c("attendance", (q) => q.eq("day", today)),
      ]);
      setS({ employees, openJobs, candidates, present });
    })();
  }, []);

  async function makeBrief() {
    setBusy(true);
    try { setBrief(await callAI("briefing", { stats: s })); } catch (e: any) { setBrief(e.message); }
    setBusy(false);
  }

  const cards = [["Employees", s.employees], ["Open roles", s.openJobs], ["Candidates", s.candidates], ["Checked in today", `${s.present}/${s.employees}`]];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {org.name}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v]) => (<div key={l as string} className="card"><p className="text-xs uppercase text-brand-700">{l}</p><p className="mt-1 text-3xl font-extrabold">{v}</p></div>))}
      </div>
      <div className="card">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Daily briefing</h2><button className="btn-primary" onClick={makeBrief} disabled={busy}>{busy ? "Writing…" : "Generate briefing"}</button></div>
        {brief && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{brief}</p>}
      </div>
    </div>
  );
}

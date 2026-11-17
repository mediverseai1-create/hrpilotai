"use client";
import { useState } from "react";
import { supabase, callAI } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Insights() {
  const org = useOrg();
  const [text, setText] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const [{ data: emps }, { data: att }] = await Promise.all([
        supabase.from("employees").select("id,department"),
        supabase.from("attendance").select("employee_id,day").gte("day", since),
      ]);
      const byDept: Record<string, { headcount: number; checkins: number }> = {};
      const dept = new Map((emps || []).map((e: any) => [e.id, e.department || "Unassigned"]));
      (emps || []).forEach((e: any) => { const d = e.department || "Unassigned"; byDept[d] ??= { headcount: 0, checkins: 0 }; byDept[d].headcount++; });
      (att || []).forEach((a: any) => { const d = dept.get(a.employee_id); if (d) byDept[d].checkins++; });
      const s = { headcount: emps?.length ?? 0, checkinsLast30Days: att?.length ?? 0, byDepartment: byDept };
      setStats(s);
      setText(await callAI("insights", { stats: s }));
    } catch (e: any) { setText(e.message); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Workforce Intelligence</h1>
      {org.plan === "free" && <p className="card text-sm">Attendance trends & insights are available on Starter and above.</p>}
      <button className="btn-primary" onClick={run} disabled={busy || org.plan === "free"}>{busy ? "Analysing…" : "Explain my workforce data"}</button>
      {stats && <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs uppercase text-brand-800"><tr><th>Department</th><th>Headcount</th><th>Check-ins (30d)</th></tr></thead><tbody>{Object.entries(stats.byDepartment).map(([d, v]: any) => (<tr key={d} className="border-t border-brand-100"><td className="py-2">{d}</td><td>{v.headcount}</td><td>{v.checkins}</td></tr>))}</tbody></table></div>}
      {text && <div className="card whitespace-pre-wrap text-sm text-gray-700">{text}</div>}
    </div>
  );
}

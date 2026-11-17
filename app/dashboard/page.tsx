"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser, isLate } from "@/components/OrgContext";

export default function Overview() {
  const user = useUser();
  const [emps, setEmps] = useState<any[]>([]);
  const [att, setAtt] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [cands, setCands] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      supabase.from("employees").select("id,name,department").eq("status", "active"),
      supabase.from("attendance").select("*").eq("day", today),
      supabase.from("jobs").select("id,status"),
      supabase.from("candidates").select("id,stage"),
    ]).then(([e, a, j, c]) => { setEmps(e.data || []); setAtt(a.data || []); setJobs(j.data || []); setCands(c.data || []); });
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const late = att.filter((a) => isLate(a.checked_in_at)).length;
  const present = att.length - late;
  const checked = new Set(att.map((a) => a.employee_id));
  const missing = emps.filter((e) => !checked.has(e.id));
  const openRoles = jobs.filter((j) => j.status === "open").length;
  const activeCands = cands.filter((c) => !["hired", "rejected"].includes(c.stage)).length;
  const awaiting = cands.filter((c) => c.stage === "applied").length;

  const Stat = ({ l, v, c = "" }: { l: string; v: number; c?: string }) => (
    <div className="panel !p-5"><p className="text-xs text-gray-500">{l}</p><p className={`mt-2 text-4xl font-bold ${c}`}>{v}</p></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greet}, {user.name.split(" ")[0]}.</h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s what&apos;s happening with your team today.</p>
        </div>
        <Link href="/dashboard/people" className="btn-accent"><Plus size={16} />Add employee</Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-sidebar px-5 py-4 text-sm text-white">
        <Sparkles size={16} className="text-mint" />
        {emps.length} active employees. {present} present and {late} late so far today, with {missing.length} not yet checked in. {openRoles ? `${openRoles} open role${openRoles > 1 ? "s" : ""} right now.` : "No open roles right now."}
      </div>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Recruiting snapshot</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat l="Open roles" v={openRoles} /><Stat l="Active candidates" v={activeCands} /><Stat l="Awaiting review" v={awaiting} /><Stat l="Total roles" v={jobs.length} />
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Workforce snapshot</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat l="Total employees" v={emps.length} /><Stat l="Present" v={present} /><Stat l="Late" v={late} c="text-orange-600" /><Stat l="Absent" v={missing.length} c="text-red-600" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h2 className="font-semibold">Today&apos;s attendance</h2>
          <div className="mt-4 rounded-xl bg-[#f7f9f4] p-4 text-sm">
            {att.length === 0 ? <p className="py-6 text-center text-gray-500">No check-ins yet today.</p> : (
              <ul className="space-y-2">{att.map((a) => (
                <li key={a.id} className="flex justify-between"><span>{emps.find((e) => e.id === a.employee_id)?.name ?? "—"}</span>
                  <span className={isLate(a.checked_in_at) ? "text-orange-600" : "text-brand-700"}>{new Date(a.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{isLate(a.checked_in_at) ? " · Late" : ""}</span></li>
              ))}</ul>)}
          </div>
        </div>
        <div className="panel">
          <h2 className="font-semibold">Needs attention</h2>
          {missing.length === 0 ? <p className="mt-4 text-sm text-gray-500">Nothing needs your attention right now.</p> : (
            <ul className="mt-4 space-y-2 text-sm">{missing.slice(0, 8).map((m) => (<li key={m.id} className="flex justify-between"><span>{m.name}</span><span className="text-red-600">Not checked in</span></li>))}</ul>)}
        </div>
      </div>
    </div>
  );
}

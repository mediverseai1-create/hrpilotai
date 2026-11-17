"use client";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useOrg, isLate } from "@/components/OrgContext";

export default function Attendance() {
  const org = useOrg();
  const [emps, setEmps] = useState<any[]>([]);
  const [att, setAtt] = useState<any[]>([]);
  const [dept, setDept] = useState("");
  const [q, setQ] = useState("");
  const [now, setNow] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink(`${window.location.origin}/checkin/${org.id}`);
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      supabase.from("employees").select("id,name,department").eq("status", "active").order("name"),
      supabase.from("attendance").select("*").eq("day", today),
    ]).then(([e, a]) => { setEmps(e.data || []); setAtt(a.data || []); });
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const rec = (id: string) => att.find((a) => a.employee_id === id);
  const status = (id: string) => { const r = rec(id); return !r ? "Absent" : isLate(r.checked_in_at) ? "Late" : "Present"; };
  const counts = { Present: 0, Late: 0, Absent: 0 } as Record<string, number>;
  emps.forEach((e) => counts[status(e.id)]++);
  const depts = Array.from(new Set(emps.map((e) => e.department).filter(Boolean)));
  const rows = emps.filter((e) => (!dept || e.department === dept) && e.name.toLowerCase().includes(q.toLowerCase()));
  const color: any = { Present: "text-brand-700", Late: "text-orange-600", Absent: "text-red-600" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Live records for {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}.</p>
      </div>

      <div className="grid max-w-xl grid-cols-3 gap-4">
        {(["Present", "Late", "Absent"] as const).map((k) => (
          <div key={k} className="panel !p-5"><p className="text-xs text-gray-500">{k}</p><p className={`mt-2 text-4xl font-bold ${k === "Late" ? "text-orange-600" : k === "Absent" ? "text-red-600" : ""}`}>{counts[k]}</p></div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="panel !p-5">
          <div className="flex gap-3">
            <select className="field !w-auto" value={dept} onChange={(e) => setDept(e.target.value)}><option value="">All departments</option>{depts.map((d: any) => <option key={d}>{d}</option>)}</select>
            <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-gray-400" /><input className="field !pl-9" placeholder="Search employee..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="mt-4 rounded-xl bg-[#f7f9f4]">
            {rows.length === 0 ? (
              <div className="py-14 text-center"><p className="font-semibold">No attendance records</p><p className="mt-1 text-sm text-gray-500">Once employees check in, their records will appear here.</p></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500"><tr><th className="px-4 py-3">Employee</th><th>Department</th><th>Status</th><th>Check-in</th></tr></thead>
                <tbody>{rows.map((e) => { const s = status(e.id); const r = rec(e.id); return (
                  <tr key={e.id} className="border-t border-black/5"><td className="px-4 py-3 font-medium">{e.name}</td><td>{e.department || "—"}</td><td className={`font-medium ${color[s]}`}>{s}</td><td>{r ? new Date(r.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td></tr>); })}</tbody>
              </table>)}
          </div>
        </div>

        <div className="panel h-fit !p-5">
          <p className="text-xs text-gray-500">Staff check-in</p>
          <p className="mt-2 text-4xl font-bold">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}</p>
          <p className="mt-1 text-xs text-gray-500">{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
          <button className="btn-dark mt-5 w-full" onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}><Copy size={16} />{copied ? "Copied!" : "Copy staff check-in link"}</button>
          <a className="btn-outline mt-3 w-full" href={link} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open check-in kiosk</a>
          <p className="mt-4 text-xs text-gray-500">Share this link with staff so they can check in from their own device — no login required.</p>
        </div>
      </div>
    </div>
  );
}

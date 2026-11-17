"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Attendance() {
  const org = useOrg();
  const [emps, setEmps] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink(`${window.location.origin}/checkin/${org.id}`);
    (async () => {
      const [{ data: e }, { data: a }] = await Promise.all([
        supabase.from("employees").select("id,name,department").eq("status", "active"),
        supabase.from("attendance").select("*").order("checked_in_at", { ascending: false }).limit(500),
      ]);
      setEmps(e || []); setRows(a || []);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const inToday = new Set(rows.filter((r) => r.day === today).map((r) => r.employee_id));
  const name = (id: string) => emps.find((e) => e.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <div className="card"><p className="label">Shared check-in link (no account needed)</p><div className="flex gap-2"><input className="input" readOnly value={link} /><button className="btn-ghost" onClick={() => navigator.clipboard.writeText(link)}>Copy</button></div></div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card"><h2 className="font-semibold">Today ({inToday.size}/{emps.length})</h2>
          <ul className="mt-3 space-y-1 text-sm">{emps.map((e) => (<li key={e.id} className="flex justify-between"><span>{e.name}</span><span className={inToday.has(e.id) ? "text-brand-700" : "text-red-500"}>{inToday.has(e.id) ? "Present" : "Not in"}</span></li>))}</ul></div>
        <div className="card"><h2 className="font-semibold">Recent check-ins</h2>
          <ul className="mt-3 space-y-1 text-sm">{rows.slice(0, 15).map((r) => (<li key={r.id} className="flex justify-between"><span>{name(r.employee_id)}</span><span className="text-gray-500">{new Date(r.checked_in_at).toLocaleString()}</span></li>))}</ul></div>
      </div>
    </div>
  );
}

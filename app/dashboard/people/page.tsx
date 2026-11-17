"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOrg, LIMITS } from "@/components/OrgContext";

export default function People() {
  const org = useOrg();
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ name: "", email: "", department: "", role: "" });

  async function load() { const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false }); setRows(data || []); }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (rows.length >= LIMITS[org.plan]) return alert(`Your ${org.plan} plan allows up to ${LIMITS[org.plan]} employees. Upgrade in Billing.`);
    const { error } = await supabase.from("employees").insert({ ...f, org_id: org.id });
    if (error) return alert(error.message);
    setF({ name: "", email: "", department: "", role: "" }); load();
  }

  async function importCsv(file: File) {
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
    const [head, ...body] = lines; const cols = head.split(",").map((c) => c.trim().toLowerCase());
    if (rows.length + body.length > LIMITS[org.plan]) return alert("This import exceeds your plan's employee limit.");
    const recs = body.map((l) => { const v = l.split(","); const o: any = { org_id: org.id }; cols.forEach((c, i) => { if (["name", "email", "department", "role"].includes(c)) o[c] = v[i]?.trim(); }); return o; }).filter((o) => o.name);
    const { error } = await supabase.from("employees").insert(recs);
    if (error) alert(error.message); load();
  }

  async function remove(id: string) { if (confirm("Delete this employee?")) { await supabase.from("employees").delete().eq("id", id); load(); } }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">People</h1>
      <form onSubmit={add} className="card grid gap-3 sm:grid-cols-5">
        {(["name", "email", "department", "role"] as const).map((k) => (<input key={k} className="input" required={k === "name"} placeholder={k[0].toUpperCase() + k.slice(1)} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />))}
        <button className="btn-primary">Add</button>
      </form>
      <div className="card flex items-center justify-between text-sm">
        <span>CSV import (columns: name,email,department,role){org.plan === "free" && " — Starter plan and above"}</span>
        <input type="file" accept=".csv" disabled={org.plan === "free"} onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
      </div>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm"><thead className="bg-brand-50 text-left text-xs uppercase text-brand-800"><tr>{["Name", "Email", "Department", "Role", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (<tr key={r.id} className="border-t border-brand-100"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3">{r.email}</td><td className="px-4 py-3">{r.department}</td><td className="px-4 py-3">{r.role}</td><td className="px-4 py-3 text-right"><button onClick={() => remove(r.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table>
        {!rows.length && <p className="p-4 text-sm text-gray-500">No employees yet.</p>}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useOrg, INDUSTRIES, SIZES, CURRENCIES } from "@/components/OrgContext";

export default function Settings() {
  const org = useOrg();
  const [f, setF] = useState({ name: org.name, industry: org.industry || "Other", size: org.size || "", country: org.country || "", currency: org.currency || "USD" });
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("organizations").update(f).eq("id", org.id);
    setMsg(error ? error.message : "Saved.");
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="mt-1 text-sm text-gray-500">Organization details and plan.</p></div>
      <form onSubmit={save} className="panel max-w-2xl space-y-4">
        <div><label className="flabel">Organization name</label><input className="field" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="flabel">Industry</label><select className="field" value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })}>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></div>
          <div><label className="flabel">Organization size</label><select className="field" value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })}><option value="">Select size</option>{SIZES.map((i) => <option key={i}>{i}</option>)}</select></div>
          <div><label className="flabel">Country</label><input className="field" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></div>
          <div><label className="flabel">Currency</label><select className="field" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}>{CURRENCIES.map((i) => <option key={i}>{i}</option>)}</select></div>
        </div>
        <div className="flex items-center gap-3"><button className="btn-accent">Save changes</button>{msg && <span className="text-sm text-gray-600">{msg}</span>}</div>
      </form>
      <div className="panel max-w-2xl"><p className="text-sm">Current plan: <b className="capitalize">{org.plan}</b></p><Link href="/dashboard/billing" className="btn-dark mt-4">Manage plan</Link></div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckIn() {
  const { org } = useParams() as { org: string };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.rpc("public_org_name", { p_org: org }).then(({ data }) => setName(data || ""));
  }, [org]);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.rpc("public_checkin", { p_org: org, p_email: email });
    if (error) return setMsg(error.message);
    if (data === "not_found") return setMsg("We couldn't find that email. Ask your HR manager.");
    setOk(true); setMsg(`Checked in. Welcome, ${data}!`);
  }

  return (
    <div className="hero-bg grid min-h-screen place-items-center px-4">
      <form onSubmit={go} className="card w-full max-w-sm space-y-4 !p-7">
        <p className="eyebrow">{name || "HRPilotAI"}</p>
        <h1 className="text-xl font-bold">Staff check-in</h1>
        {!ok && (<>
          <div><label className="label">Work email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button className="btn-primary w-full">Check in</button>
        </>)}
        {msg && <p className={`text-sm ${ok ? "text-brand-700" : "text-red-600"}`}>{msg}</p>}
      </form>
    </div>
  );
}

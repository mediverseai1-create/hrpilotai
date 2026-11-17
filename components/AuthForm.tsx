"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const res = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (res.error) return setMsg(res.error.message);
    if (mode === "signup" && !res.data.session) return setMsg("Check your email to confirm your account, then log in.");
    router.push("/dashboard");
  }

  return (
    <div className="hero-bg grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 !p-7">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white"><Bot size={16} /></span>HRPilotAI
        </Link>
        <h1 className="text-xl font-bold">{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
        <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}</button>
        <p className="text-center text-sm text-gray-600">
          {mode === "login" ? <>No account? <Link className="font-semibold text-brand-700" href="/signup">Sign up</Link></> : <>Have an account? <Link className="font-semibold text-brand-700" href="/login">Log in</Link></>}
        </p>
      </form>
    </div>
  );
}

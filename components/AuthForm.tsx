"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const res = signup
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) return setMsg(res.error.message);
    if (signup && !res.data.session) return setMsg("Check your email to confirm your account, then sign in.");
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white md:flex"
        style={{ backgroundImage: "radial-gradient(600px 400px at 85% 0%, rgba(74,222,128,.28), transparent 60%), radial-gradient(500px 300px at 20% 100%, rgba(74,222,128,.12), transparent 60%)" }}>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-mint text-sidebar"><Bot size={16} /></span>
          <span><b>HRPilot</b>AI</span>
        </Link>
        <div>
          <h2 className="max-w-sm text-4xl font-bold leading-tight">{signup ? "Workforce data your whole team can trust." : "Welcome back to your workforce."}</h2>
          <p className="mt-4 max-w-sm text-sm text-gray-300">
            {signup ? "Set up your organization, add your team, and get a clear read on attendance and trends." : "Sign in to review candidates, attendance and the documents waiting for you."}
          </p>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} HRPilotAI. Workforce intelligence for growing teams.</p>
      </div>

      <div className="grid place-items-center bg-paper px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{signup ? "Create your account" : "Sign in"}</h1>
            <p className="mt-1 text-sm text-gray-500">{signup ? "Start understanding your workforce in minutes." : "Enter your details to continue."}</p>
          </div>
          {signup && (<div><label className="flabel">Full name</label><input className="field" required placeholder="Favour Adeyemi" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>)}
          <div><label className="flabel">Work email</label><input className="field" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="flabel">Password</label><input className="field" type="password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button className="btn-accent w-full !py-3.5" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
          <p className="text-center text-sm text-gray-500">
            {signup ? <>Already have an account? <Link className="font-semibold text-ink" href="/login">Sign in</Link></> : <>New here? <Link className="font-semibold text-ink" href="/signup">Create an account</Link></>}
          </p>
        </form>
      </div>
    </div>
  );
}

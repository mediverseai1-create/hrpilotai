"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, LayoutGrid, UserPlus, Users, Clock, BarChart3, MessagesSquare, FilePen, BookOpen, Settings, Bell, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { OrgCtx, UserCtx, Org, AppUser, INDUSTRIES, SIZES, CURRENCIES } from "@/components/OrgContext";

const nav = [
  ["/dashboard", "Overview", LayoutGrid],
  ["/dashboard/recruiting", "Recruiting", UserPlus],
  ["/dashboard/people", "People", Users],
  ["/dashboard/attendance", "Attendance", Clock],
  ["/dashboard/insights", "Workforce Intelligence", BarChart3],
  ["/dashboard/assistant", "HR Assistant", MessagesSquare],
  ["/dashboard/documents", "Documents", FilePen],
  ["/dashboard/knowledge", "Company Knowledge", BookOpen],
] as const;

function Logo({ dark }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${dark ? "bg-sidebar text-mint" : "bg-mint text-sidebar"}`}><Bot size={18} /></span>
      <span className={dark ? "text-ink" : "text-white"}><b>HRPilot</b>AI</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [org, setOrg] = useState<Org | null>(null);
  const [user, setUser] = useState<AppUser>({ name: "", email: "" });
  const [ready, setReady] = useState(false);
  const [f, setF] = useState({ name: "", industry: "Hospitality", size: "", country: "", currency: "USD" });
  const [err, setErr] = useState("");

  async function load() {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    if (!u) return router.replace("/login");
    const email = u.email || "";
    setUser({ name: u.user_metadata?.full_name || email.split("@")[0], email });
    const { data: orgs } = await supabase.from("organizations").select("*").limit(1);
    setOrg(orgs?.[0] ?? null);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("organizations").insert({ ...f, owner_id: u.user!.id }).select().single();
    if (error) return setErr(error.message.includes("column") || error.message.includes("permission")
      ? "Database needs the latest migration (supabase/migration_002_org_profile.sql). " + error.message : error.message);
    setOrg(data);
  }

  if (!ready) return <div className="grid min-h-screen place-items-center bg-paper text-gray-500">Loading…</div>;

  if (!org)
    return (
      <div className="min-h-screen bg-paper px-6 py-8">
        <div className="mx-auto max-w-xl"><Logo dark /></div>
        <form onSubmit={createOrg} className="mx-auto mt-8 max-w-xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold">Tell us about your organization</h1>
          <p className="mt-1 text-sm text-gray-500">This sets up your workspace. You can change these details later in Settings.</p>
          <div className="mt-6 space-y-4">
            <div><label className="flabel">Organization name</label><input className="field" required placeholder="Incomio Limited" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="flabel">Industry</label><select className="field" value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })}>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></div>
              <div><label className="flabel">Organization size</label><select className="field" required value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })}><option value="">Select size</option>{SIZES.map((i) => <option key={i}>{i}</option>)}</select></div>
              <div><label className="flabel">Country</label><input className="field" placeholder="Nigeria" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></div>
              <div><label className="flabel">Currency</label><select className="field" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}>{CURRENCIES.map((i) => <option key={i}>{i}</option>)}</select></div>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-accent w-full !py-3.5">Continue to dashboard</button>
          </div>
        </form>
      </div>
    );

  const initial = (user.name || "U")[0].toUpperCase();
  return (
    <OrgCtx.Provider value={org}>
      <UserCtx.Provider value={user}>
        <div className="flex min-h-screen bg-paper">
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar px-3 py-5 md:flex">
            <div className="mb-6 px-2"><Logo /></div>
            <nav className="flex-1 space-y-1">
              {nav.map(([href, label, I]) => {
                const on = href === "/dashboard" ? path === href : path.startsWith(href);
                return (
                  <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${on ? "bg-mint text-sidebar" : "text-gray-300 hover:bg-white/5"}`}>
                    <I size={18} />{label}
                  </Link>
                );
              })}
            </nav>
            <Link href="/dashboard/settings" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${path.startsWith("/dashboard/settings") ? "bg-mint text-sidebar" : "text-gray-300 hover:bg-white/5"}`}><Settings size={18} />Settings</Link>
            <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-2 pt-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-sm font-bold text-sidebar">{initial}</span>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user.name}</p><p className="truncate text-xs text-gray-400">{user.email}</p></div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="flex items-center justify-end gap-4 border-b border-black/5 bg-[#f6f9f3] px-6 py-3">
              {org.plan !== "pro" && <Link href="/dashboard/billing" className="rounded-md bg-mint px-2.5 py-1 text-xs font-bold text-sidebar">Upgrade</Link>}
              <Link href="/dashboard/settings" className="flex items-center gap-1 text-sm font-medium">{org.name}<ChevronDown size={14} className="text-gray-500" /></Link>
              <Bell size={18} className="text-gray-500" />
              <span className="grid h-8 w-8 place-items-center rounded-full bg-mint text-sm font-bold text-sidebar">{initial}</span>
              <button className="text-xs text-gray-500 hover:text-ink" onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Log out</button>
            </header>
            <div className="flex gap-2 overflow-x-auto px-4 pt-4 md:hidden">
              {nav.map(([href, label]) => (<Link key={href} href={href} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${path === href ? "bg-mint text-sidebar" : "border border-gray-200 bg-white"}`}>{label}</Link>))}
            </div>
            <main className="p-4 md:p-8">{children}</main>
          </div>
        </div>
      </UserCtx.Provider>
    </OrgCtx.Provider>
  );
}

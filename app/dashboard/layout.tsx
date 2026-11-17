"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, LayoutDashboard, Briefcase, Users, CalendarCheck, LineChart, FileText, MessageSquare, CreditCard, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { OrgCtx, Org } from "@/components/OrgContext";

const nav = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/recruiting", "Recruiting", Briefcase],
  ["/dashboard/people", "People", Users],
  ["/dashboard/attendance", "Attendance", CalendarCheck],
  ["/dashboard/insights", "Insights", LineChart],
  ["/dashboard/documents", "Documents", FileText],
  ["/dashboard/assistant", "Assistant", MessageSquare],
  ["/dashboard/billing", "Billing", CreditCard],
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [org, setOrg] = useState<Org | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return router.replace("/login");
    const { data: orgs } = await supabase.from("organizations").select("*").limit(1);
    setOrg(orgs?.[0] ?? null);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("organizations").insert({ name, owner_id: u.user!.id }).select().single();
    if (error) return alert(error.message);
    setOrg(data);
  }

  if (!ready) return <div className="grid min-h-screen place-items-center text-gray-500">Loading…</div>;

  if (!org)
    return (
      <div className="hero-bg grid min-h-screen place-items-center px-4">
        <form onSubmit={createOrg} className="card w-full max-w-sm space-y-4 !p-7">
          <h1 className="text-xl font-bold">Name your organization</h1>
          <input className="input" required placeholder="Acme Ltd" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary w-full">Create workspace</button>
        </form>
      </div>
    );

  return (
    <OrgCtx.Provider value={org}>
      <div className="flex min-h-screen bg-brand-50/40">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-brand-100 bg-white p-4 md:flex">
          <Link href="/" className="mb-6 flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white"><Bot size={16} /></span>HRPilotAI
          </Link>
          <nav className="flex-1 space-y-1">
            {nav.map(([href, label, I]) => (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${path === href ? "bg-brand-100 text-brand-800" : "text-gray-600 hover:bg-brand-50"}`}>
                <I size={18} />{label}
              </Link>
            ))}
          </nav>
          <p className="truncate text-xs text-gray-500">{org.name} · {org.plan}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="mt-2 flex items-center gap-2 text-sm text-gray-600"><LogOut size={16} />Log out</button>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {nav.map(([href, label]) => (<Link key={href} href={href} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${path === href ? "bg-brand-500 text-white" : "bg-white border border-brand-200"}`}>{label}</Link>))}
          </div>
          {children}
        </main>
      </div>
    </OrgCtx.Provider>
  );
}

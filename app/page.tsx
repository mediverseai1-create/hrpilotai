import Link from "next/link";
import { Bot, ClipboardCheck, CalendarCheck, LineChart, FileText, BookOpen, ShieldCheck, UserCheck, Database, Check, ChevronDown } from "lucide-react";
import { PAYMENT_LINKS } from "@/lib/supabase";

const features = [
  { icon: Bot, title: "Recruiting Agent", text: "Describe who you need in plain language. HRPilotAI drafts the posting, then reads and ranks every applicant against your requirements." },
  { icon: ClipboardCheck, title: "Screening & interviews", text: "Auto-generated screening questions and interview briefs, plus structured, evidence-based notes after every conversation." },
  { icon: CalendarCheck, title: "Attendance & people", text: "Staff check in from a shared link with no account. Every employee gets one workspace for attendance, documents and notes." },
  { icon: LineChart, title: "Workforce intelligence", text: "Attendance patterns, department trends and staffing shifts explained in plain language, backed by the real numbers." },
  { icon: FileText, title: "HR documents", text: "Say what happened. HRPilotAI pulls the relevant records and drafts the query, warning or reference letter for your review." },
  { icon: BookOpen, title: "Company knowledge", text: "Upload your policies once. Ask anything — every answer is grounded in your own documents, never a guess." },
];

const modules = [
  ["01", "RECRUIT", "Recruiting Agent", "One hiring request in — a posting, a pipeline and ranked candidates out."],
  ["02", "EVALUATE", "Screening & Interviews", "Questions, briefs and evidence-based summaries prepared before you ask."],
  ["03", "TRACK", "Attendance & People", "Check-ins and records for every employee, in one workspace."],
  ["04", "UNDERSTAND", "Workforce Intelligence", "Trends, anomalies and risks in your data — explained, not just charted."],
  ["05", "RESOLVE", "Documents & Knowledge", "Letters drafted from real records. Policy questions answered from your handbook."],
];

const faqs = [
  ["Is HRPilotAI a replacement for the HR software we already use?", "It can be. Many small teams use it as their only HR system; others run it alongside payroll tools and use it for hiring, attendance and documents."],
  ["Where does the data in my dashboard come from?", "From what you add: employees you import or create, applications you receive, and check-ins from your staff link. Nothing is invented."],
  ["Does HRPilotAI make hiring or disciplinary decisions on its own?", "No. It prepares shortlists, briefs and drafts. Hiring, discipline and termination decisions always stay with your team."],
  ["How do I upgrade my plan?", "Open Billing in your dashboard and choose Starter or Pro. You'll be taken to a secure checkout."],
];

const plans = [
  { name: "Free", price: "$0", note: "Try HRPilotAI with a small team.", items: ["Up to 10 employees", "Attendance check-in", "Basic dashboard overview", "1 department"], cta: "Get started free", href: "/signup" },
  { name: "Starter", price: "$47", per: "/month", note: "For growing teams that need real workforce visibility.", items: ["Up to 100 employees", "CSV workforce import", "Attendance trends & insights", "Unlimited departments", "Exportable reports"], cta: "Upgrade to Starter", href: PAYMENT_LINKS.starter, popular: true },
  { name: "Pro", price: "$97", per: "/month", note: "Full workforce intelligence for scaling organizations.", items: ["Unlimited employees", "Everything in Starter", "AI writing assistant for HR letters", "AI-grounded insights", "Priority support"], cta: "Upgrade to Pro", href: PAYMENT_LINKS.pro },
];

export default function Home() {
  return (
    <div>
      <header className="fixed inset-x-0 top-3 z-50 mx-auto flex max-w-4xl items-center justify-between rounded-full border border-brand-100 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white"><Bot size={16} /></span>HRPilotAI
        </Link>
        <nav className="hidden gap-6 text-sm text-gray-600 md:flex">
          <a href="#platform">Product</a><a href="#modules">Modules</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-medium">Log in</Link>
          <Link href="/signup" className="btn-primary !py-1.5">Get Started</Link>
        </div>
      </header>

      <section id="platform" className="hero-bg px-4 pb-16 pt-36 text-center">
        <span className="inline-flex rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-gray-600">Platform · One AI HR operating system, not six disconnected tools</span>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          The AI <span className="text-brand-600">Human Resource Manager</span> for teams that have outgrown spreadsheets<span className="text-brand-500">.</span>
        </h1>
        <p className="mt-5 text-lg font-semibold">Your company&apos;s HR, powered by AI.</p>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          HRPilotAI recruits, screens and interviews candidates, tracks attendance and people, explains your workforce data and drafts the documents you need — from one connected workspace, not a stack of forms.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/signup" className="btn-primary">Get Started →</Link>
          <a href="#how" className="btn-ghost">See How It Works</a>
        </div>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2 text-xs">
          {["Need to hire", "Find & review candidates", "Screen", "Interview", "Hire", "Onboard", "Manage", "Understand your workforce"].map((s) => (
            <span key={s} className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-gray-700">{s}</span>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-brand-100 bg-white p-6 text-left shadow-xl">
          <div className="mb-4 flex gap-2 text-xs font-medium">
            {["Briefing", "Overview", "Attendance", "Insights"].map((t, i) => (
              <span key={t} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-800"}`}>{t}</span>
            ))}
            <span className="ml-auto text-gray-400">Demo data</span>
          </div>
          <p className="text-gray-700">Good morning. Fourteen new applications arrived overnight — three candidates for the Product Designer role meet the core requirements. Two interviews are scheduled today. One employee expected at 8:00 AM hasn&apos;t checked in.</p>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {["3 items need your attention", "2 interviews are scheduled today", "14 new applications were received", "1 employee has not checked in"].map((x) => (
              <div key={x} className="rounded-xl bg-brand-50 px-3 py-2 text-brand-900">{x}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow">What HRPilotAI handles</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold sm:text-4xl">Hiring already happens in your inbox. Most teams never turn it into a pipeline.</h2>
        <p className="mt-3 max-w-3xl text-gray-600">HRPilotAI reads the hiring request you type, the applications that arrive and the records you already have — and turns them into a working pipeline, a screened shortlist and the documents you need.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: I, title, text }) => (
            <div key={title} className="card">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><I size={20} /></span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modules" className="bg-brand-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Five modules, one workspace</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Not eight disconnected tools. One system built to run your HR.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {modules.map(([n, tag, t, d]) => (
              <div key={n} className="card">
                <p className="text-xs text-brand-600">{n} · {tag}</p>
                <h3 className="mt-2 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Minimum input. Maximum output.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[["Create your workspace", "Sign up and tell us a little about your organization."], ["Bring your team and your hiring", "Add employees, or describe a role you need to fill — HRPilotAI takes it from there."], ["Review, don't re-type", "Candidates get screened, interviews get prepared and letters get drafted. You review and approve."]].map(([t, d], i) => (
            <div key={t} className="card">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow !text-brand-300">Built for businesses, not hobby projects</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">AI that shows its work — and knows where to stop.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[[Database, "Evidence, not vibes", "Every AI match, summary and recommendation traces back to the record it came from."], [UserCheck, "Human review, always", "Hiring, discipline and termination decisions stay with your team."], [ShieldCheck, "Isolated by design", "Each organization's data is isolated at the database level with row-level security."]].map(([I, t, d]: any) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <I className="text-brand-400" />
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-gray-300">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow text-center">Pricing</p>
        <h2 className="mt-2 text-center text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
        <p className="mt-2 text-center text-gray-600">Start free. Upgrade when your team outgrows it.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`card relative ${p.popular ? "border-2 border-brand-500" : ""}`}>
              {p.popular && <span className="absolute -top-3 left-5 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.note}</p>
              <p className="mt-4 text-4xl font-extrabold">{p.price}<span className="text-sm font-medium text-gray-500">{p.per}</span></p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.items.map((i) => (<li key={i} className="flex gap-2"><Check size={16} className="mt-0.5 text-brand-600" />{i}</li>))}
              </ul>
              <a href={p.href} className={`${p.popular ? "btn-primary" : "btn-ghost"} mt-6 w-full`}>{p.cta}</a>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 pb-20">
        <p className="eyebrow text-center">FAQ</p>
        <h2 className="mt-2 text-center text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">{q}<ChevronDown size={18} className="transition group-open:rotate-180" /></summary>
              <p className="mt-3 text-sm text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hero-bg px-4 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">Your company&apos;s HR, powered by AI — starting today.</h2>
        <Link href="/signup" className="btn-primary mt-6">Get Started</Link>
      </section>

      <footer className="border-t border-brand-100 px-4 py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} HRPilotAI. All rights reserved.</footer>
    </div>
  );
}

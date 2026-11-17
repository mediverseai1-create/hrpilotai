"use client";
import { supabase, PAYMENT_LINKS } from "@/lib/supabase";
import { useOrg } from "@/components/OrgContext";

export default function Billing() {
  const org = useOrg();
  const plans = [["starter", "Starter", "$47/month", "Up to 100 employees, CSV import, insights"], ["pro", "Pro", "$97/month", "Unlimited employees, AI letters, priority support"]] as const;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="card text-sm">Current plan: <b className="capitalize">{org.plan}</b></p>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map(([k, n, p, d]) => (
          <div key={k} className="card"><h2 className="font-bold">{n} <span className="font-normal text-gray-500">{p}</span></h2><p className="mt-1 text-sm text-gray-600">{d}</p>
            <a className="btn-primary mt-4" href={`${PAYMENT_LINKS[k]}${PAYMENT_LINKS[k].includes("?") ? "&" : "?"}client_reference_id=${org.id}`}>Upgrade to {n}</a></div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Use the same email you signed up with at checkout. Your plan is upgraded automatically once payment is confirmed.</p>
    </div>
  );
}

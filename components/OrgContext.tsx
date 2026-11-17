"use client";
import { createContext, useContext } from "react";

export type Org = {
  id: string; name: string; plan: string;
  industry?: string; size?: string; country?: string; currency?: string;
};
export type AppUser = { name: string; email: string };

export const OrgCtx = createContext<Org | null>(null);
export const UserCtx = createContext<AppUser>({ name: "", email: "" });
export const useOrg = () => useContext(OrgCtx)!;
export const useUser = () => useContext(UserCtx);

export const LIMITS: Record<string, number> = { free: 10, starter: 100, pro: Infinity };
export const LATE_AFTER_HOUR = 9; // check-ins after 09:00 local time count as late

export const INDUSTRIES = ["Hospitality", "Technology", "Healthcare", "Retail", "Education", "Finance", "Manufacturing", "Logistics", "Construction", "Other"];
export const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
export const CURRENCIES = ["USD", "NGN", "GBP", "EUR", "GHS", "KES", "ZAR"];

export function isLate(iso: string) {
  const d = new Date(iso);
  return d.getHours() > LATE_AFTER_HOUR || (d.getHours() === LATE_AFTER_HOUR && d.getMinutes() > 0);
}

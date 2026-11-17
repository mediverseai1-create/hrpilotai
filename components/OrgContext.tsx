"use client";
import { createContext, useContext } from "react";

export type Org = { id: string; name: string; plan: string };
export const OrgCtx = createContext<Org | null>(null);
export const useOrg = () => useContext(OrgCtx)!;

export const LIMITS: Record<string, number> = { free: 10, starter: 100, pro: Infinity };

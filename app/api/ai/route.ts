import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const prompts: Record<string, (p: any) => string> = {
  job_post: (p) =>
    `You are an HR recruiter. Write a clear, inclusive job posting (title, summary, responsibilities, requirements, benefits placeholder) from this hiring request:\n${p.request}`,
  screen: (p) =>
    `You are screening a candidate. Compare the resume to the role requirements. Respond ONLY with JSON: {"score": number 0-100, "summary": string, "strengths": string[], "gaps": string[]}. Cite evidence from the resume. Do not make a hiring decision.\n\nROLE: ${p.title}\nREQUIREMENTS:\n${p.requirements}\n\nRESUME:\n${p.resume}`,
  interview: (p) =>
    `Prepare an interview brief for the role "${p.title}": 8 structured screening questions with what a good answer looks like.\nRequirements:\n${p.requirements}\nCandidate summary:\n${p.summary ?? ""}`,
  insights: (p) =>
    `You are an HR analyst. Explain these workforce numbers in plain language: key trends, anomalies, risks and 3 recommended actions. Reference the numbers.\n${JSON.stringify(p.stats)}`,
  briefing: (p) =>
    `Write a short, friendly morning HR briefing (max 90 words) from these numbers:\n${JSON.stringify(p.stats)}`,
  document: (p) =>
    `Draft a professional HR ${p.type} for a manager to review. Use only the facts given; mark anything missing as [PLACEHOLDER]. Facts:\n${p.facts}\nEmployee records:\n${JSON.stringify(p.records ?? {})}`,
  assistant: (p) =>
    `Answer the question using ONLY the company knowledge below. If the answer is not there, say you don't have it in the uploaded documents.\n\nKNOWLEDGE:\n${p.knowledge}\n\nQUESTION: ${p.question}`,
};

export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { data: user } = await sb.auth.getUser(token);
    if (!user?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { task, payload } = await req.json();
    const build = prompts[task];
    if (!build) return NextResponse.json({ error: "Unknown task" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: build(payload) }] }] }),
      }
    );
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ error: j?.error?.message || "Gemini error" }, { status: 502 });
    const text = j?.candidates?.[0]?.content?.parts?.map((x: any) => x.text).join("") ?? "";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

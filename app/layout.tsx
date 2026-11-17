import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HRPilotAI — AI HR manager for growing teams",
  description:
    "HRPilotAI recruits, screens, tracks attendance, explains workforce data and drafts HR documents from one connected workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

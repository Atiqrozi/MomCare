"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileText } from "lucide-react";
import { Card } from "@/components/ui";

export function DemoBanner({ children = "Mode demo · Data layanan tersambung segera hadir." }: { children?: React.ReactNode }) {
  return <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p><b>Demo / Segera hadir:</b> {children}</p></div>;
}
export function Metric({ label, value, note, tone = "teal" }: { label: string; value: string; note: string; tone?: "teal" | "rose" | "amber" | "blue" }) {
  const colors = { teal: "bg-teal-50 text-teal-700", rose: "bg-rose-50 text-rose-600", amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700" };
  return <Card><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-800">{value}</p><p className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${colors[tone]}`}>{note}</p></Card>;
}
export function SectionHeading({ title, href, action = "Lihat semua" }: { title: string; href?: string; action?: string }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-800">{title}</h2>{href && <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-teal-700">{action}<ArrowRight className="size-4" /></Link>}</div>;
}
export function RiskBadge({ risk }: { risk: string }) {
  const style = risk === "Tinggi" ? "bg-rose-100 text-rose-700" : risk === "Waspada" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>{risk}</span>;
}
export function DemoCard({ title, icon = <FileText className="size-5" /> }: { title: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="font-bold">{title}</span></div><p className="mt-2 text-sm text-slate-500">Fitur prototipe · Integrasi backend dan penyimpanan data segera hadir.</p></div>;
}
export function StatusDot({ children }: { children: React.ReactNode }) { return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600"><CheckCircle2 className="size-4 text-emerald-500" />{children}</span>; }
export function TimeLabel({ children }: { children: React.ReactNode }) { return <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><Clock3 className="size-4" />{children}</span>; }

import Link from "next/link";
import { Baby, BookOpen, CalendarDays, ClipboardList, FileHeart, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ClinicalDisclaimer, PageTitle } from "@/components/ui";
import { PregnancyProfileForm } from "@/components/pregnancy-profile-form";
import { serverApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

type Profile = { lmpDate?: string; estimatedDueDate?: string; pregnancyStatus?: string };
type Timeline = { currentWeek: number | null; profile: Profile | null };

export default async function PregnancyPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const timeline = live ? await serverApi<Timeline>("/pregnancy/timeline").catch(() => null) : null;
  const profile = timeline?.profile ?? null;
  const week = live ? timeline?.currentWeek : 24;
  const links = [[CalendarDays, "Jadwal ANC", "/jadwal-anc"], [ClipboardList, "Jurnal harian", "/kehamilan/jurnal"], [FileHeart, "Rekam medis", "/rekam-medis"], [Baby, "Persiapan kelahiran", "/hpk"], [BookOpen, "Edukasi", "/edukasi"], [ShieldCheck, "Layanan RS", "/layanan-rs"]] as const;
  return <AppShell user={user}>
    <PageTitle eyebrow="Perjalanan kehamilan" title="Kehamilan" description="Pantau jadwal, rekam medis, dan jurnal perjalanan kehamilan Anda." />
    <ClinicalDisclaimer />
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><Card className="overflow-hidden bg-gradient-to-br from-[#ff5b9d] via-brand to-[#758df5] text-white"><div className="flex items-start justify-between"><div><p className="text-sm text-white/75">Usia kehamilan (perkiraan)</p><p className="mt-2 text-5xl font-black">{week ?? "—"} <span className="text-xl font-medium">minggu</span></p><p className="mt-3 text-sm text-white/75">{profile?.estimatedDueDate ? `Perkiraan persalinan ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(profile.estimatedDueDate))}` : "Lengkapi profil untuk menampilkan perkiraan perjalanan."}</p></div><HeartPulse className="size-9 text-pink-200" /></div><div className="mt-7 h-2 rounded-full bg-white/20"><div className="h-full rounded-full bg-pink-200" style={{ width: `${Math.min(((week ?? 0) / 40) * 100, 100)}%` }} /></div><div className="mt-3 flex justify-between text-xs text-white/70"><span>Trimester 1</span><span>Trimester 2</span><span>Trimester 3</span></div></Card><Card><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-mint text-brand"><CalendarDays /></div><div><p className="text-sm text-muted">Data kehamilan</p><p className="font-black">{profile?.pregnancyStatus ?? "Belum diatur"}</p></div></div><Link href="/jadwal-anc" className="mt-5 block text-sm font-bold text-brand">Lihat jadwal ANC →</Link></Card></div>
    <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Fitur perjalanan Bunda</h2><Sparkles className="text-brand" /></div><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">{links.map(([Icon, label, href]) => <Link key={label} href={href} className="rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand"><Icon className="text-brand" /><p className="mt-3 text-sm font-bold">{label}</p></Link>)}</div></section>
    <div className="mt-8"><PregnancyProfileForm initialProfile={profile} /></div>
  </AppShell>;
}

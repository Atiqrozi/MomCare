import Link from "next/link";
import { redirect } from "next/navigation";
import { Baby, Bell, BookOpen, Building2, CalendarDays, ChevronRight, FileText, Heart, MessageCircle, Pill, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import type { Appointment, PageResult } from "@/lib/types";

type Profile = { lmpDate?: string; estimatedDueDate?: string; pregnancyStatus?: string };
type Timeline = { currentWeek: number | null; profile: Profile | null };
type ApiAppointment = Appointment & { _id?: string; facilityId?: string };

const features = [
  { href: "/jadwal-anc", title: "Jadwal ANC", icon: CalendarDays, color: "border-blue-100 bg-blue-50 text-blue-600" },
  { href: "/rekam-medis", title: "Rekam Medis & Jurnal", icon: FileText, color: "border-pink-100 bg-pink-50 text-pink-600" },
  { href: "/edukasi", title: "Edukasi", icon: BookOpen, color: "border-emerald-100 bg-emerald-50 text-emerald-600" },
  { href: "/layanan-rs", title: "Layanan RS", icon: Building2, color: "border-sky-100 bg-sky-50 text-sky-600" },
  { href: "/konsultasi", title: "Konsultasi", icon: MessageCircle, color: "border-purple-100 bg-purple-50 text-purple-600" },
  { href: "/pengingat", title: "Pengingat Obat & Vitamin", icon: Pill, color: "border-amber-100 bg-amber-50 text-amber-600" },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [timeline, appointmentResult] = live ? await Promise.all([
    serverApi<Timeline>("/pregnancy/timeline").catch(() => null),
    serverApi<PageResult<ApiAppointment> | ApiAppointment[]>("/pregnancy/anc-appointments?limit=1").catch(() => ({ data: [] })),
  ]) : [null, null];
  const profile = timeline?.profile;
  const week = timeline?.currentWeek ?? null;
  const day = profile?.lmpDate ? Math.max(0, Math.floor((Date.now() - new Date(profile.lmpDate).getTime()) / 86_400_000)) % 7 : null;
  const trimester = week == null ? null : week < 14 ? 1 : week < 28 ? 2 : 3;
  const hpl = profile?.estimatedDueDate ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(profile.estimatedDueDate)) : "Belum dicatat";
  const next = Array.isArray(appointmentResult) ? appointmentResult[0] : appointmentResult?.data?.[0];
  return <AppShell user={user}>
    <div className="mx-auto max-w-5xl">
      <div className="-mx-5 -mt-5 mb-5 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50/70 px-5 py-5 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div><h1 className="flex items-center gap-1.5 text-xl font-extrabold text-slate-900">Halo, {user.fullName.split(" ")[0]}! <span aria-hidden>👋</span></h1><p className="mt-1 text-sm text-slate-500">Semoga hari ini sehat selalu</p></div>
        <Link href="/pengingat" aria-label="Lihat notifikasi" className="relative grid size-11 place-items-center rounded-full border border-pink-100 bg-white text-slate-700 shadow-sm"><Bell className="size-5" /><span className="absolute right-2.5 top-2 size-2 rounded-full bg-pink-500 ring-2 ring-white" /></Link>
      </div>
      {!live && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Hubungkan backend untuk memuat profil kehamilan dan jadwal pribadi.</p>}
      <Link href="/kehamilan" className="block rounded-3xl border border-pink-200/70 bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 p-5 shadow-sm transition hover:shadow-md"><div className="flex items-center justify-between gap-4"><div><span className="text-sm font-semibold text-pink-700/80">Usia Kehamilan</span><p className="mt-1 text-2xl font-extrabold text-slate-900">{week == null ? "Belum dicatat" : `${week} minggu ${day ?? 0} hari`}</p><p className="mt-3 text-xs text-slate-500">HPL</p><p className="text-sm font-extrabold text-slate-800">{hpl}</p></div><div className="flex flex-col items-center"><span className="grid size-24 place-items-center rounded-full border-[7px] border-pink-300 bg-gradient-to-br from-pink-200 to-rose-100 text-pink-500 shadow-inner"><Baby className="size-12" /></span>{trimester && <span className="mt-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-pink-600">Trimester {trimester} · Minggu {week}</span>}</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: `${Math.min(((week ?? 0) / 40) * 100, 100)}%` }} /></div></Link>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{features.map(({ href, title, icon: Icon, color }) => <Link key={href} href={href} className="flex min-h-40 flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md"><span className={`mb-3 grid size-14 place-items-center rounded-2xl border ${color}`}><Icon className="size-6" /></span><span className="text-sm font-bold leading-tight text-slate-700">{title}</span></Link>)}</div>
      <div className="mt-5 grid grid-cols-2 gap-3"><Link href="/kehamilan/jurnal/baru" className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-4 text-white shadow-sm"><p className="text-xs font-bold uppercase opacity-90">Journey Harian</p><p className="mt-1 text-sm font-extrabold">Isi jurnal keluhan hari ini ✍️</p></Link><Link href="/kehamilan" className="rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-4 text-white shadow-sm"><p className="text-xs font-bold uppercase opacity-90">Skrining Medis</p><p className="mt-1 text-sm font-extrabold">Persiapan lahir & kesehatan ibu</p></Link></div>
      <Link href="/edukasi" className="mt-4 flex items-center gap-3 rounded-2xl border border-pink-100 bg-gradient-to-r from-amber-50 via-pink-50 to-white p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-amber-500"><Sparkles className="size-5" /></span><span className="flex-1"><b className="text-sm text-slate-800">Tips Hari Ini</b><span className="mt-1 block text-xs leading-5 text-slate-600">Jelajahi materi edukasi dan diskusikan pertanyaan kesehatan dengan tenaga kesehatan Anda.</span></span><ChevronRight className="size-4 text-pink-500" /></Link>
      <Link href="/hpk" className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50/70 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500 text-white"><Baby className="size-5" /></span><span className="flex-1"><b className="text-sm text-slate-800">1000 Hari Pertama Kehidupan</b><span className="mt-1 block text-xs text-slate-500">Panduan tumbuh kembang, imunisasi, dan MPASI anak</span></span><ChevronRight className="size-4 text-sky-600" /></Link>
      <Card className="mt-5"><div className="flex items-center gap-3"><CalendarDays className="size-5 text-blue-600" /><div className="flex-1"><h2 className="text-sm font-extrabold">Jadwal ANC berikutnya</h2>{next ? <p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(next.scheduledAt))} WIB · {next.visitType ?? "Kunjungan ANC"}</p> : <p className="mt-1 text-xs text-slate-500">{live ? "Belum ada jadwal ANC." : "Jadwal pribadi tampil setelah backend diaktifkan."}</p>}</div><Link href="/jadwal-anc" className="text-xs font-bold text-blue-600">Lihat</Link></div></Card>
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-xs leading-5 text-rose-800"><Heart className="mt-0.5 size-4 shrink-0" />Usia kehamilan dihitung dari HPHT pada profil. Untuk pertanyaan atau gejala yang mengkhawatirkan, hubungi tenaga kesehatan.</div>
    </div>
  </AppShell>;
}

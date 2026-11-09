import Link from "next/link";
import { BookOpen } from "lucide-react";
import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { EducationWorkflow } from "@/components/education-workflow";
import { educationMaterials } from "@/lib/nakes-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Item = { _id: string; title: string; summary: string; body: string; category: string; status: string; reviewNote?: string; sourceVersion?: string };
type PageData<T> = { data: T[] };
const editorialRoles = ["CONTENT_EDITOR", "CLINICAL_REVIEWER", "ADMIN"];

export default async function EducationPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { status } = await searchParams;
  const canManage = editorialRoles.includes(user.role);
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const query = status && status !== "all" ? `&status=${encodeURIComponent(status)}` : "";
  const result = live && canManage ? await serverApi<PageData<Item>>(`/education/internal/list?limit=100${query}`).catch(() => ({ data: [] })) : null;
  return <NakesShell user={user}>
    <PageTitle eyebrow="Materi terkurasi" title="Edukasi Pasien" description={canManage ? "Kelola konten dan proses tinjauan klinis." : "Materi edukasi terbit yang tersedia untuk dibagikan kepada pasien."} action={user.role === "CONTENT_EDITOR" ? <Link href="/dashboard/edukasi/baru" className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">Tambah materi</Link> : undefined} />
    {!canManage && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Pengelolaan konten hanya tersedia bagi editor konten, reviewer klinis, dan admin.</div>}
    {live && canManage ? <><nav className="mb-5 flex flex-wrap gap-2">{[["all", "Semua"], ["draft", "Draf"], ["in_review", "Dalam review"], ["approved", "Disetujui"], ["published", "Terbit"], ["archived", "Arsip"]].map(([value, label]) => <Link key={value} href={value === "all" ? "/dashboard/edukasi" : `/dashboard/edukasi?status=${value}`} className={`rounded-full px-4 py-2 text-sm font-bold ${status === value || (!status && value === "all") ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</Link>)}</nav><EducationWorkflow items={result?.data ?? []} role={user.role} /></> : <><DemoBanner>Daftar materi ini hanya contoh. Mode live memakai daftar konten publik dari endpoint edukasi.</DemoBanner><div className="grid gap-4 md:grid-cols-2">{educationMaterials.map(([title, category, duration]) => <Card key={title}><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><BookOpen /></span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{category}</span></div><h2 className="mt-4 font-black">{title}</h2><p className="mt-2 text-sm text-slate-500">Materi contoh berbasis informasi kesehatan ibu dan anak.</p><div className="mt-5 flex items-center justify-between"><span className="text-xs text-slate-400">{duration} baca</span></div></Card>)}</div></>}
  </NakesShell>;
}

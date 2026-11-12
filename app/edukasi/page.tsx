import Link from "next/link";
import { ArrowUpRight, BookOpen, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageTitle } from "@/components/ui";
import { demoEducation } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import type { Education } from "@/lib/types";

export default async function EducationPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { q = "" } = await searchParams;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  let publishedItems: Education[] = [];
  let loadFailed = false;
  if (live) {
    try {
      const response = await serverApi<Education[]>("/education?limit=100");
      publishedItems = Array.isArray(response) ? response : [];
    } catch {
      loadFailed = true;
    }
  }
  const showingPreviousMaterials = live && !loadFailed && publishedItems.length === 0;
  const items = (live ? (showingPreviousMaterials ? demoEducation : publishedItems) : demoEducation).filter((item) => `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(q.toLowerCase()));
  return <AppShell user={user}>
    <PageTitle eyebrow="Pusat pengetahuan" title="Edukasi maternal" description="Materi pilihan dengan sumber yang transparan untuk menemani persiapan Anda." />
    {showingPreviousMaterials && <p className="mb-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800">Materi edukasi sebelumnya ditampilkan sementara. Artikel baru akan muncul setelah disetujui dan diterbitkan.</p>}
    {loadFailed && <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Materi terbaru gagal dimuat dari server. Coba muat ulang halaman.</p>}
    <form action="/edukasi" method="get" className="mb-7 flex max-w-xl items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-muted"><Search className="size-5" /><input name="q" defaultValue={q} className="w-full outline-none" placeholder="Cari materi edukasi..." aria-label="Cari materi edukasi" /><button className="font-bold text-brand">Cari</button></form>
    {items.length ? <div className="grid gap-5 md:grid-cols-2">{items.map((item) => <Card key={item.id ?? item.slug} className="group"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-mint text-brand"><BookOpen /></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">{item.category}</span></div><h2 className="mt-5 text-xl font-black">{item.title}</h2><p className="mt-2 leading-7 text-muted">{item.summary}</p><div className="mt-5 flex items-center justify-between border-t border-line pt-4"><p className="text-xs text-muted">Sumber: {item.sourceTitle}</p><Link href={`/edukasi/${item.slug}`} className="flex items-center gap-1 text-sm font-bold text-brand">Baca <ArrowUpRight className="size-4" /></Link></div></Card>)}</div> : <EmptyState title="Materi belum tersedia" description="Materi edukasi yang sudah diterbitkan akan tampil di sini." />}
  </AppShell>;
}

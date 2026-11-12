import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ClinicalDisclaimer } from "@/components/ui";
import { demoEducation } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import type { Education } from "@/lib/types";
import { EducationArticleBody } from "@/components/education-article-body";

export default async function EducationDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser(); if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const item = live
    ? (await serverApi<Education>(`/education/${encodeURIComponent(slug)}`).catch(() => null)) ?? demoEducation.find((education) => education.slug === slug)
    : demoEducation.find((education) => education.slug === slug);
  if (!item) notFound();
  return <AppShell user={user}><article className="mx-auto max-w-3xl py-5"><Link href="/edukasi" className="flex items-center gap-2 text-sm font-bold text-brand"><ArrowLeft className="size-4" />Kembali ke edukasi</Link><span className="mt-8 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold text-brand"><BookOpen className="size-4" />{item.category}</span><h1 className="mt-5 text-4xl font-black leading-tight">{item.title}</h1><p className="mt-4 text-muted">Diperbarui {formatDate(item.updatedAt)}</p><Card className="mt-8"><EducationArticleBody body={item.body} /></Card><div className="mt-6"><ClinicalDisclaimer /></div><div className="mt-8 rounded-2xl border border-line bg-white p-5 text-sm"><p className="font-bold">Sumber materi</p><p className="mt-2 text-muted">{item.sourceTitle} · {item.sourceVersion}</p></div></article></AppShell>;
}

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageTitle } from "@/components/ui";
import { demoJournals } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import type { Journal } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { JournalActions } from "@/components/journal-actions";

export default async function JournalPage() {
  const user = await getCurrentUser(); if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const result = live ? await serverApi<Array<Journal & { _id?: string }>>("/pregnancy/journals?limit=100").catch(() => []) : null;
  const journals = live ? (Array.isArray(result) ? result : []).map((journal) => ({ ...journal, id: journal._id ?? journal.id })) : demoJournals;
  return <AppShell user={user}><PageTitle eyebrow="Catatan pribadi" title="Jurnal kehamilan" description="Catat suasana hati dan pengalaman harian Anda. Jurnal ini bukan diagnosis medis." action={<Link href="/kehamilan/jurnal/baru" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white">+ Tulis jurnal</Link>} />{journals.length ? <div className="grid gap-4 md:grid-cols-2">{journals.map((journal) => <Card key={journal.id}><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-brand">{formatDate(journal.entryDate)}</p><h2 className="mt-2 text-lg font-black">{journal.mood ?? "Tanpa suasana hati"}</h2></div><span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-brand-dark">Pribadi</span></div>{journal.symptoms && journal.symptoms.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{journal.symptoms.map((symptom) => <span key={symptom} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-muted">{symptom}</span>)}</div>}<p className="mt-4 leading-7 text-muted">{journal.notes}</p>{live && <JournalActions id={journal.id} entryDate={journal.entryDate} mood={journal.mood} notes={journal.notes} symptoms={journal.symptoms} />}</Card>)}</div> : <EmptyState title="Belum ada jurnal" description="Mulai catat momen perjalanan Anda hari ini." />}</AppShell>;
}

import { FileHeart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ClinicalDisclaimer, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { PageResult } from "@/lib/types";

type MedicalRecord = { _id: string; recordDate: string; recordType: string; summary: string; verificationStatus: string; measurements?: { weightKg?: number; systolicMmHg?: number; diastolicMmHg?: number } };

export default async function MedicalRecordsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const result = live ? await serverApi<PageResult<MedicalRecord>>("/pregnancy/medical-records?limit=100").catch(() => ({ data: [] })) : null;
  const records = result?.data ?? [];
  return <AppShell user={user}>
    <PageTitle eyebrow="Riwayat kesehatan" title="Rekam medis" description="Riwayat pemeriksaan yang tersedia untuk Anda." />
    <ClinicalDisclaimer />
    {!live && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Rekam medis pasien hanya ditampilkan dari backend. Mode demo tidak memuat catatan kesehatan.</p>}
    <div className="mt-6 space-y-4">{records.length ? records.map((record) => <Card key={record._id} className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-12 place-items-center rounded-xl bg-mint text-brand"><FileHeart /></div><div className="flex-1"><p className="text-sm font-bold text-brand">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(record.recordDate))}</p><h2 className="mt-1 font-black">{record.recordType}</h2><p className="mt-1 text-sm text-muted">{record.summary}</p>{record.measurements && <p className="mt-2 text-xs text-muted">{record.measurements.weightKg != null ? `Berat ${record.measurements.weightKg} kg · ` : ""}{record.measurements.systolicMmHg != null ? `Tekanan darah ${record.measurements.systolicMmHg}/${record.measurements.diastolicMmHg ?? "—"} mmHg` : ""}</p>}</div><div className="text-left sm:text-right"><StatusBadge status={record.verificationStatus} /><p className="mt-2 text-xs text-muted">Status verifikasi dari tenaga kesehatan</p></div></Card>) : <EmptyState title="Belum ada rekam medis" description="Riwayat akan muncul setelah tersedia dari fasilitas kesehatan." />}</div>
  </AppShell>;
}

import Link from "next/link";
import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { PregnancyChart } from "@/components/pregnancy-chart";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Detail = { patient: { fullName: string }; medicalRecords: Array<{ _id: string; recordDate: string; recordType: string; measurements?: { weightKg?: number; heightCm?: number; systolicMmHg?: number; diastolicMmHg?: number; pulseBpm?: number; lilaCm?: number; tfuCm?: number; fetalHeartRateBpm?: number } }> };

export default async function PregnancyChartPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const detail = live ? await serverApi<Detail>(`/dashboard/patients/${encodeURIComponent(id)}`).catch(() => null) : null;
  return <NakesShell user={user}>
    <Link href={`/dashboard/pasien/${encodeURIComponent(id)}`} className="text-sm font-bold text-blue-700">← Kembali ke RM pasien</Link>
    <PageTitle eyebrow="Buku KIA" title="Grafik Evaluasi Kehamilan & RM" description="Tinjau tren berat badan, tinggi badan, tekanan darah, nadi, LILA, TFU, dan DJJ dari catatan ANC." />
    {!live ? <DemoBanner>Grafik klinis tidak menggunakan data contoh. Aktifkan backend untuk memuat pengukuran pasien.</DemoBanner> : detail ? <PregnancyChart patientName={detail.patient.fullName} records={detail.medicalRecords} /> : <Card><h2 className="font-black">Data pasien tidak tersedia</h2><p className="mt-2 text-sm text-slate-500">Pasien mungkin tidak berada dalam cakupan akses Anda.</p></Card>}
  </NakesShell>;
}

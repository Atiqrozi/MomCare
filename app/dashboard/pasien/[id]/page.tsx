import Link from "next/link";
import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { PatientRecordTabs, type PatientDetailData } from "@/components/patient-record-tabs";

export default async function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const detail = live ? await serverApi<PatientDetailData>(`/dashboard/patients/${encodeURIComponent(id)}`).catch(() => null) : null;
  return <NakesShell user={user}>
    <Link href="/dashboard/pasien" className="text-sm font-bold text-blue-700">← Kembali ke daftar pasien</Link>
    {!live ? <><PageTitle eyebrow="Rekam medis pasien" title="Detail pasien" description="Mode demo tidak menampilkan rekam medis klinis sintetis." /><DemoBanner>Hubungkan backend untuk membuka data pasien yang ditugaskan.</DemoBanner></> : !detail ? <><PageTitle eyebrow="Rekam medis pasien" title="Data pasien tidak tersedia" description="Pasien mungkin tidak berada dalam cakupan akses Anda." /><Card><p className="text-sm text-slate-600">Periksa koneksi API, ID pasien, dan penugasan tenaga kesehatan.</p></Card></> : <><PageTitle eyebrow="Rekam medis pasien" title={detail.patient.fullName} description={[detail.patient.phone, detail.patient.email].filter(Boolean).join(" · ") || "Data pasien dalam cakupan layanan Anda."} /><PatientRecordTabs detail={detail} /></>}
  </NakesShell>;
}

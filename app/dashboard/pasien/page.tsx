import Link from "next/link";
import { UsersRound } from "lucide-react";
import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { nakesPatients } from "@/lib/nakes-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { PatientSelectionLink } from "@/components/patient-selection-link";
import { PatientFilters } from "@/components/patient-filters";

type PatientRow = {
  userId: string;
  lmpDate?: string;
  nik?: string;
  bpjsNumber?: string;
  birthDate?: string;
  education?: string;
  occupation?: string;
  bloodType?: string;
  estimatedDueDate?: string;
  latestMedicalRecord?: { measurements?: { systolicMmHg?: number; diastolicMmHg?: number }; recordDate?: string; details?: { deliveryRecommendation?: string } } | null;
  latestRiskAssessment?: { level: string; mapMmHg: number } | null;
  patient?: { fullName?: string; email?: string; phone?: string };
};
type PageData<T> = { data: T[]; meta?: { total: number } };
type PatientView = PatientRow & { name: string; age: string; week: number | null; day: number | null; risk: string; bp: string; map: string };

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string; trimester?: string; risk?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { q = "", trimester = "all", risk = "all" } = await searchParams;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const page = live
    ? await serverApi<PageData<PatientRow> | PatientRow[]>(`/dashboard/patients?limit=100${q ? `&search=${encodeURIComponent(q)}` : ""}`).catch(() => ({ data: [] }))
    : null;
  const patientRows = Array.isArray(page) ? page : page?.data ?? [];
  const liveRows: PatientView[] = patientRows.map((row) => {
    const elapsedDays = row.lmpDate ? Math.max(0, Math.floor((Date.now() - new Date(row.lmpDate).getTime()) / 86_400_000)) : null;
    const week = elapsedDays === null ? null : Math.floor(elapsedDays / 7);
    const day = elapsedDays === null ? null : elapsedDays % 7;
    const assessment = row.latestRiskAssessment;
    const level = assessment?.level;
    const riskLabel = level === "urgent" || level === "elevated" ? "Tinggi" : level === "follow_up" ? "Sedang" : level === "no_flag" ? "Rendah" : "Belum dinilai";
    const measurements = row.latestMedicalRecord?.measurements;
    const bp = measurements?.systolicMmHg != null && measurements.diastolicMmHg != null ? `${measurements.systolicMmHg}/${measurements.diastolicMmHg}` : "—";
    const map = assessment ? String(assessment.mapMmHg) : measurements?.systolicMmHg != null && measurements.diastolicMmHg != null ? ((measurements.systolicMmHg + 2 * measurements.diastolicMmHg) / 3).toFixed(1) : "—";
    const age = row.birthDate ? String(Math.max(0, new Date().getFullYear() - new Date(row.birthDate).getFullYear() - (new Date().getMonth() < new Date(row.birthDate).getMonth() || (new Date().getMonth() === new Date(row.birthDate).getMonth() && new Date().getDate() < new Date(row.birthDate).getDate()) ? 1 : 0))) : "—";
    return { ...row, name: row.patient?.fullName ?? "Pasien", age, week, day, risk: riskLabel, bp, map };
  });
  const mockRows: PatientView[] = nakesPatients.filter((item) => item.name.toLowerCase().includes(q.toLowerCase()) || item.nik.includes(q)).map((item) => ({
    userId: item.id, name: item.name, age: String(item.age), week: Number.parseInt(item.gestationalAge, 10), day: 0, nik: item.nik, bloodType: "—", education: "—", occupation: "—", risk: item.risk, bp: item.bloodPressure, map: "—", patient: { fullName: item.name },
  }));
  const rows = (live ? liveRows : mockRows).filter((row) => {
    const rowTrimester = row.week === null ? "none" : row.week <= 13 ? "1" : row.week <= 27 ? "2" : "3";
    const rowRisk = row.risk === "Rendah" ? "low" : row.risk === "Sedang" ? "medium" : row.risk === "Tinggi" ? "high" : "none";
    return (trimester === "all" || trimester === rowTrimester) && (risk === "all" || risk === rowRisk);
  });
  const riskClass = (value: string) => value === "Rendah" ? "bg-emerald-100 text-emerald-700" : value === "Sedang" ? "bg-amber-100 text-amber-800" : value === "Tinggi" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600";

  return <NakesShell user={user}>
    <PageTitle eyebrow="Cakupan layanan" title="Daftar Pasien Ibu Hamil" description="Pilih pasien untuk mengecek Rekam Medis (RM), mengisi Pencatatan ANC, atau melihat Grafik Evaluasi Kehamilan." action={<Link href="/dashboard/anc/baru" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">+ Input ANC</Link>} />
    {!live && <DemoBanner>Data contoh prototipe. Data klinis contoh tidak untuk keputusan medis.</DemoBanner>}
    <Card className="border-slate-200 p-0 shadow-sm"><PatientFilters q={q} trimester={trimester} risk={risk} />
      {rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1240px] border-collapse text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold text-slate-500"><th className="px-4 py-3">Nama & NIK / JKN</th><th className="px-3 py-3">Usia & Gol. Darah</th><th className="px-3 py-3">Usia Kehamilan</th><th className="px-3 py-3">Risiko & MAP</th><th className="px-3 py-3">Rekomendasi Lahir</th><th className="px-4 py-3 text-right">Aksi Rekam Medis (RM)</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs">{rows.map((patient) => {
        const trimesterNumber = patient.week === null ? null : patient.week <= 13 ? 1 : patient.week <= 27 ? 2 : 3;
        const deliveryRecommendation = patient.latestMedicalRecord?.details?.deliveryRecommendation;
        const selected = { id: patient.userId, name: patient.name, gestationalAge: patient.week === null ? "Usia kehamilan belum dicatat" : `${patient.week} minggu ${patient.day} hari` };
        return <tr key={patient.userId} className="transition hover:bg-sky-50/40"><td className="px-4 py-4"><PatientSelectionLink patient={selected} href={`/dashboard/pasien/${patient.userId}`} className="font-extrabold text-slate-900 hover:text-blue-700">{patient.name}</PatientSelectionLink><p className="mt-1 max-w-64 break-words text-[10px] text-slate-400">NIK: {patient.nik ?? "—"} · JKN: {patient.bpjsNumber ?? "—"}</p></td><td className="px-3 py-4 text-slate-600"><p>{patient.age} thn · Gol. {patient.bloodType ?? "—"}</p><p className="text-[10px] text-slate-400">{[patient.education, patient.occupation].filter(Boolean).join(" · ") || "—"}</p></td><td className="px-3 py-4"><p className="font-bold text-slate-800">{patient.week === null ? "Usia kehamilan belum dicatat" : `${patient.week} minggu ${patient.day} hari`}</p><p className="text-[10px] text-slate-400">{trimesterNumber ? `Trimester ${trimesterNumber}` : "HPHT belum dicatat"}</p></td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${riskClass(patient.risk)}`}>{patient.risk}</span><p className="mt-1 text-[10px] font-semibold text-slate-500">TD {patient.bp} {patient.map !== "—" ? `(MAP ${patient.map})` : ""}</p></td><td className="px-3 py-4"><span className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${deliveryRecommendation?.toLowerCase().includes("sc") ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{deliveryRecommendation ?? "Belum dicatat"}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><PatientSelectionLink patient={selected} href={`/dashboard/pasien/${patient.userId}`} className="rounded-xl bg-sky-50 px-3 py-3 text-center text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white">Cek<br />RM</PatientSelectionLink><PatientSelectionLink patient={selected} href={`/dashboard/anc/baru?patientId=${encodeURIComponent(patient.userId)}`} className="rounded-xl bg-pink-50 px-3 py-3 text-center text-xs font-bold text-pink-600 hover:bg-pink-500 hover:text-white">Input<br />ANC</PatientSelectionLink><PatientSelectionLink patient={selected} href={`/dashboard/jadwal/baru?patientId=${encodeURIComponent(patient.userId)}`} className="rounded-xl bg-emerald-50 px-3 py-3 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white">Jadwalkan<br />ANC</PatientSelectionLink><PatientSelectionLink patient={selected} href={`/dashboard/pasien/${patient.userId}/grafik`} className="rounded-xl bg-purple-50 px-3 py-3 text-center text-xs font-bold text-purple-600 hover:bg-purple-600 hover:text-white">Grafik<br />KIA</PatientSelectionLink></div></td></tr>;
      })}</tbody></table></div> : <div className="px-6 py-14 text-center"><UsersRound className="mx-auto size-9 text-slate-300" /><p className="mt-3 font-bold text-slate-600">Tidak ada pasien sesuai filter</p><p className="mt-1 text-sm text-slate-400">Coba ubah kata pencarian, trimester, atau tingkat risiko.</p>{(q || trimester !== "all" || risk !== "all") && <Link href="/dashboard/pasien" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Tampilkan semua ibu hamil</Link>}</div>}
      <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">{rows.length} pasien ditampilkan · Data risiko mengikuti skrining terakhir, jika tersedia.</div>
    </Card>
  </NakesShell>;
}

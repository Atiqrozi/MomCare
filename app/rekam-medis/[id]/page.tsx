import Link from "next/link";
import { ArrowLeft, FileHeart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MedicalAttachmentLink } from "@/components/medical-attachment-link";
import { Card, ClinicalDisclaimer, PageTitle, StatusBadge } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Attachment = { kind: string; name: string; mimeType: string; url?: string; fileId?: string };
type MedicalRecord = {
  _id: string; recordDate: string; recordType: string; summary: string; verificationStatus: string;
  verificationNote?: string; verifiedAt?: string;
  measurements?: {
    weightKg?: number; heightCm?: number; systolicMmHg?: number; diastolicMmHg?: number;
    pulseBpm?: number; lilaCm?: number; tfuCm?: number; fetalHeartRateBpm?: number;
    nutritionStatus?: string; tetanusStatus?: string; fetalPresentation?: string;
    fetalMovement?: string; edema?: string; conjunctiva?: string;
  };
  details?: {
    ultrasound?: { bpdCm?: string; abdominalCircumferenceCm?: string; femurLengthCm?: string; estimatedFetalWeightGrams?: string; amnioticFluidIndexCm?: string; placenta?: string; note?: string };
    laboratory?: { hemoglobin?: string; urineProtein?: string; urineReduction?: string; glucose?: string; tripleElimination?: string; note?: string };
    treatment?: { ironTablets?: string; calcium?: string; aspirin?: string; referral?: string };
    attachments?: Attachment[];
    deliveryRecommendation?: string; preeclampsiaAssessment?: string; consultationNote?: string;
    educationAdvice?: string; nextVisitDate?: string;
  };
};

function formatDate(value?: string) {
  if (!value) return "Belum dicatat";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function Detail({ label, value, unit }: { label: string; value?: string | number | null; unit?: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-bold text-slate-800">{value !== undefined && value !== null && value !== "" ? `${value}${unit ? ` ${unit}` : ""}` : "Belum dicatat"}</p></div>;
}

function TextDetail({ label, value }: { label: string; value?: string }) {
  return <div className="mt-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{value || "Belum dicatat"}</p></div>;
}

export default async function MedicalRecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  let record: MedicalRecord | null = null;
  let error = "";
  try {
    record = await serverApi<MedicalRecord>(`/pregnancy/medical-records/${encodeURIComponent(id)}`);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Detail rekam medis gagal dimuat.";
  }

  return <AppShell user={user}>
    <Link href="/rekam-medis" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"><ArrowLeft className="size-4" /> Kembali ke daftar rekam medis</Link>
    <PageTitle eyebrow="Riwayat kesehatan" title={record?.recordType ?? "Detail rekam medis"} description={record ? formatDate(record.recordDate) : "Rincian hasil pemeriksaan ANC."} />
    <ClinicalDisclaimer />
    {error ? <Card className="mt-6 border-red-200 bg-red-50 text-sm text-red-800">Detail rekam medis gagal dimuat: {error}</Card> : record ? <div className="mt-6 space-y-5">
      <Card><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-xl bg-pink-50 text-pink-600"><FileHeart /></div><div><p className="text-xs font-bold text-brand">{formatDate(record.recordDate)}</p><h2 className="mt-1 text-lg font-black">{record.recordType}</h2></div></div><div className="text-right"><StatusBadge status={record.verificationStatus} /><p className="mt-2 text-xs text-muted">{record.verifiedAt ? `Diverifikasi ${formatDate(record.verifiedAt)}` : "Status verifikasi dari tenaga kesehatan"}</p></div></div><p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{record.summary}</p>{record.verificationNote && <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><b>Catatan verifikasi:</b> {record.verificationNote}</p>}</Card>

      <Card><h2 className="font-black">Pemeriksaan dan tanda vital</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Berat badan" value={record.measurements?.weightKg} unit="kg" /><Detail label="Tinggi badan" value={record.measurements?.heightCm} unit="cm" /><Detail label="Tekanan darah" value={record.measurements?.systolicMmHg != null ? `${record.measurements.systolicMmHg}/${record.measurements.diastolicMmHg ?? "—"}` : undefined} unit="mmHg" /><Detail label="Frekuensi nadi" value={record.measurements?.pulseBpm} unit="x/menit" /><Detail label="LILA" value={record.measurements?.lilaCm} unit="cm" /><Detail label="Tinggi fundus uteri" value={record.measurements?.tfuCm} unit="cm" /><Detail label="Denyut jantung janin" value={record.measurements?.fetalHeartRateBpm} unit="bpm" /><Detail label="Status gizi" value={record.measurements?.nutritionStatus} /><Detail label="Status imunisasi tetanus" value={record.measurements?.tetanusStatus} /><Detail label="Presentasi janin" value={record.measurements?.fetalPresentation} /><Detail label="Gerakan janin" value={record.measurements?.fetalMovement} /><Detail label="Edema" value={record.measurements?.edema} /><Detail label="Konjungtiva" value={record.measurements?.conjunctiva} /></div></Card>

      <div className="grid gap-5 lg:grid-cols-2"><Card><h2 className="font-black">Hasil USG</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Detail label="BPD" value={record.details?.ultrasound?.bpdCm} /><Detail label="Lingkar perut janin (AC)" value={record.details?.ultrasound?.abdominalCircumferenceCm} /><Detail label="Panjang femur (FL)" value={record.details?.ultrasound?.femurLengthCm} /><Detail label="Taksiran berat janin" value={record.details?.ultrasound?.estimatedFetalWeightGrams} unit="gram" /><Detail label="Indeks cairan ketuban (AFI)" value={record.details?.ultrasound?.amnioticFluidIndexCm} /><Detail label="Letak plasenta" value={record.details?.ultrasound?.placenta} /></div><TextDetail label="Kesimpulan USG" value={record.details?.ultrasound?.note} /></Card>
        <Card><h2 className="font-black">Hasil laboratorium</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Detail label="Hemoglobin" value={record.details?.laboratory?.hemoglobin} unit="g/dL" /><Detail label="Protein urine" value={record.details?.laboratory?.urineProtein} /><Detail label="Urin reduksi" value={record.details?.laboratory?.urineReduction} /><Detail label="Glukosa" value={record.details?.laboratory?.glucose} /><Detail label="Skrining triple eliminasi" value={record.details?.laboratory?.tripleElimination} /></div><TextDetail label="Catatan laboratorium" value={record.details?.laboratory?.note} /></Card></div>

      <div className="grid gap-5 lg:grid-cols-2"><Card><h2 className="font-black">Tindakan dan rencana</h2><div className="mt-4 space-y-3"><Detail label="Tablet tambah darah" value={record.details?.treatment?.ironTablets} /><Detail label="Kalsium" value={record.details?.treatment?.calcium} /><Detail label="Aspirin" value={record.details?.treatment?.aspirin} /><Detail label="Rujukan" value={record.details?.treatment?.referral} /><Detail label="Rekomendasi persalinan" value={record.details?.deliveryRecommendation} /><Detail label="Penilaian risiko preeklamsia" value={record.details?.preeclampsiaAssessment} /><Detail label="Kontrol berikutnya" value={formatDate(record.details?.nextVisitDate)} /></div></Card>
        <Card><h2 className="font-black">Konsultasi dan edukasi</h2><TextDetail label="Catatan konsultasi" value={record.details?.consultationNote} /><TextDetail label="Edukasi dan anjuran" value={record.details?.educationAdvice} /></Card></div>

      {record.details?.attachments?.length ? <Card><h2 className="font-black">Lampiran pemeriksaan</h2><div className="mt-4 flex flex-wrap gap-2">{record.details.attachments.map((file, index) => file.fileId ? <MedicalAttachmentLink key={`${file.fileId}-${index}`} recordId={record._id} fileId={file.fileId} name={file.name} label={file.kind === "ultrasound" ? "Buka lampiran USG" : "Buka hasil laboratorium"} /> : file.url ? <a key={`${file.name}-${index}`} href={file.url} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Buka {file.name}</a> : null)}</div></Card> : null}
    </div> : <Card className="mt-6 text-sm text-muted">Rekam medis tidak ditemukan atau tidak dapat diakses.</Card>}
  </AppShell>;
}

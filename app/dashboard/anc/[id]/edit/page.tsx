import { notFound, redirect } from "next/navigation";
import type { ComponentProps } from "react";
import { MedicalRecordForm } from "@/components/medical-record-form";
import { NakesShell } from "@/components/nakes-shell";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type FormRecord = NonNullable<ComponentProps<typeof MedicalRecordForm>["editingRecord"]> & { patientId: string };
type FormPatient = NonNullable<ComponentProps<typeof MedicalRecordForm>["patients"]>[number];
type PageData<T> = { data: T[] };

export default async function EditMedicalRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!["DOCTOR", "MIDWIFE", "ADMIN"].includes(user.role)) redirect("/dashboard");

  const { id } = await params;
  let record: FormRecord;
  let patients: FormPatient[];
  try {
    [record, patients] = await Promise.all([
      serverApi<FormRecord>(`/pregnancy/medical-records/${encodeURIComponent(id)}`),
      serverApi<PageData<FormPatient> | FormPatient[]>("/dashboard/patients?limit=100").then((result) => Array.isArray(result) ? result : result.data ?? []),
    ]);
  } catch {
    notFound();
  }

  const patient = patients.find((item) => item.userId === record.patientId);
  if (!patient) notFound();

  return <NakesShell user={user}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Rekam medis ANC</p><h1 className="mt-1 text-xl font-black text-slate-900">Ubah hasil pemeriksaan</h1><p className="mt-1 text-sm text-slate-500">Data yang tersimpan dimuat kembali ke form penginputan ANC.</p></div>
      <a href={`/dashboard/pasien/${encodeURIComponent(record.patientId)}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">Kembali ke profil pasien</a>
    </div>
    <MedicalRecordForm patients={[patient]} initialPatientId={record.patientId} editingRecord={record} />
  </NakesShell>;
}

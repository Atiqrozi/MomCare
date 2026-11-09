import { NakesShell } from "@/components/nakes-shell";
import { DemoBanner } from "@/components/nakes-ui";
import { MedicalRecordForm } from "@/components/medical-record-form";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Patient = { userId: string; lmpDate?: string; patient?: { fullName?: string } };
type PageData<T> = { data: T[] };

export default async function ANCInputPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { patientId = "" } = await searchParams;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const patientsResult = live ? await serverApi<PageData<Patient> | Patient[]>("/dashboard/patients?limit=100").catch(() => []) : { data: [] };
  const patients = Array.isArray(patientsResult) ? patientsResult : patientsResult?.data ?? [];
  return <NakesShell user={user}>
    {!live && <DemoBanner>Pencatatan klinis tersedia saat backend aktif (NEXT_PUBLIC_ENABLE_MOCKS=false).</DemoBanner>}
    <MedicalRecordForm patients={patients} initialPatientId={patientId} />
  </NakesShell>;
}

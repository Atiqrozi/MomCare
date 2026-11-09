import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { AppointmentCreateForm } from "@/components/appointment-create-form";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Patient = { userId: string; patient?: { fullName?: string } };
type Facility = { _id: string; name: string };
type PageData<T> = { data: T[] };

export default async function CreateAppointmentPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { patientId = "" } = await searchParams;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [patientPage, facilityPage] = live ? await Promise.all([
    serverApi<PageData<Patient> | Patient[]>("/dashboard/patients?limit=100").catch(() => []),
    serverApi<Facility[]> ("/facilities").catch(() => []),
  ]) : [{ data: [] }, []];
  const patients = Array.isArray(patientPage) ? patientPage : patientPage?.data ?? [];
  return <NakesShell user={user}>
    <PageTitle eyebrow="Jadwal pelayanan" title="Buat jadwal ANC" description="Pilih pasien dalam cakupan Anda, fasilitas, dan waktu kunjungan." />
    {!live && <DemoBanner>Form pembuatan jadwal tersambung ke backend saat NEXT_PUBLIC_ENABLE_MOCKS=false.</DemoBanner>}
    <Card><AppointmentCreateForm patients={patients} facilities={facilityPage} initialPatientId={patientId} /></Card>
  </NakesShell>;
}

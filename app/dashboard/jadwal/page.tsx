import Link from "next/link";
import { NakesShell } from "@/components/nakes-shell";
import { PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { todayAppointments } from "@/lib/nakes-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { AppointmentCalendar, type CalendarAppointment } from "@/components/appointment-calendar";

type Appointment = { _id: string; scheduledAt: string; status: string; visitType?: string; patientId: string; insuranceType?: string };
type Patient = { userId: string; patient?: { fullName?: string } };
type PageData<T> = { data: T[] };

export default async function StaffAppointmentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { status } = await searchParams;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const query = status && status !== "all" ? `&status=${encodeURIComponent(status)}` : "";
  const [appointments, patients] = live ? await Promise.all([
    serverApi<PageData<Appointment>>(`/dashboard/appointments?limit=100${query}`).catch(() => ({ data: [] })),
    serverApi<PageData<Patient>>("/dashboard/patients?limit=100").catch(() => ({ data: [] })),
  ]) : [null, null];
  const names = new Map((patients?.data ?? []).map((patient) => [patient.userId, patient.patient?.fullName ?? "Pasien"]));
  const rows: CalendarAppointment[] = live ? (appointments?.data ?? []).map((item) => ({ id: item._id, patientId: item.patientId, scheduledAt: item.scheduledAt, patient: names.get(item.patientId) ?? "Pasien dalam cakupan Anda", type: item.visitType ?? "Kunjungan ANC", status: item.status, insuranceType: item.insuranceType })) : todayAppointments.map((item, index) => ({ id: `${item.time}-${index}`, patientId: `p${index}`, scheduledAt: new Date(`${new Date().toISOString().slice(0, 10)}T${item.time}:00+07:00`).toISOString(), patient: item.patient, type: item.type, status: "confirmed" }));
  return <NakesShell user={user}>
    <PageTitle eyebrow="Layanan maternal" title="Jadwal Kunjungan ANC" description="Pilih tanggal untuk melihat pasien, mengubah status, atau membuka input pemeriksaan." action={<Link href="/dashboard/jadwal/baru" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">+ Buat jadwal</Link>} />
    {!live && <DemoBanner>Jadwal kalender ini menggunakan data contoh dalam mode demo.</DemoBanner>}
    <nav className="mb-5 flex flex-wrap gap-2">{[["all", "Semua"], ["scheduled", "Terjadwal"], ["confirmed", "Dikonfirmasi"], ["completed", "Selesai"], ["missed", "Terlewat"], ["cancelled", "Dibatalkan"]].map(([value, label]) => <Link key={value} href={value === "all" ? "/dashboard/jadwal" : `/dashboard/jadwal?status=${value}`} className={`rounded-full px-4 py-2 text-xs font-bold ${status === value || (!status && value === "all") ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</Link>)}</nav>
    <AppointmentCalendar appointments={rows} />
  </NakesShell>;
}

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { NakesShell } from "@/components/nakes-shell";
import { Card, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { todayAppointments } from "@/lib/nakes-data";

type Appointment = { _id: string; patientId: string; scheduledAt: string; status: string; visitType?: string };
type Patient = { userId: string; patient?: { fullName?: string } };
type PageData<T> = { data: T[] };

export default async function MissedAppointmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [missed, patients] = live ? await Promise.all([
    serverApi<PageData<Appointment>>("/dashboard/missed-appointments?limit=100").catch(() => ({ data: [] })),
    serverApi<PageData<Patient>>("/dashboard/patients?limit=100").catch(() => ({ data: [] })),
  ]) : [null, null];
  const names = new Map((patients?.data ?? []).map((patient) => [patient.userId, patient.patient?.fullName ?? "Pasien"]));
  const rows = live ? (missed?.data ?? []).map((item) => ({
    id: item._id,
    patientId: item.patientId,
    name: names.get(item.patientId) ?? "Pasien dalam cakupan Anda",
    when: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.scheduledAt)),
    type: item.visitType ?? "Kunjungan ANC",
    status: item.status,
  })) : todayAppointments.slice(0, 1).map((item, index) => ({ id: String(index), patientId: `p${index}`, name: item.patient, when: `${item.time} WIB`, type: item.type, status: "missed" }));
  return <NakesShell user={user}>
    <PageTitle eyebrow="Tindak lanjut" title="Jadwal terlewat" description="Daftar mengikuti status dan aturan jadwal dari backend." />
    {!live && <DemoBanner>Data tindak lanjut contoh untuk prototipe.</DemoBanner>}
    <Card className="border-amber-200 bg-amber-50"><div className="flex gap-3 text-amber-800"><AlertTriangle className="size-5 shrink-0" /><p className="text-sm">Hubungi pasien sesuai cakupan dan izin komunikasi yang berlaku. MomCare tidak menentukan kondisi klinis pasien.</p></div></Card>
    <div className="mt-5 space-y-3">{rows.length ? rows.map((item) => <Card key={item.id}><div className="flex flex-wrap items-center gap-4"><div className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-600"><AlertTriangle /></div><div className="flex-1"><p className="font-black">{item.name}</p><p className="mt-1 text-sm text-slate-500">{item.type} · {item.when}</p></div><StatusBadge status={item.status} /><Link href={`/dashboard/pasien/${encodeURIComponent(item.patientId)}`} className="text-sm font-bold text-teal-700">Detail</Link></div></Card>) : <EmptyState title="Tidak ada jadwal terlewat" description="Jadwal yang perlu ditindaklanjuti akan muncul di sini." />}</div>
  </NakesShell>;
}

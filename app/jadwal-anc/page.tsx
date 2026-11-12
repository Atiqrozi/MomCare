import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppointmentActions } from "@/components/appointment-actions";
import { Card, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { demoAppointments } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

type Appointment = { _id?: string; id?: string; scheduledAt: string; status: string; visitType?: string; providerId?: string; facilityId?: string; facilityName?: string; reminderStatus?: string };

export default async function AppointmentPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  let appointments: Appointment[] = [];
  let appointmentsError = "";
  if (live) {
    try {
      appointments = await serverApi<Appointment[]>("/pregnancy/anc-appointments?limit=100");
    } catch (error) {
      appointmentsError = error instanceof Error ? error.message : "Jadwal ANC gagal dimuat.";
    }
  } else {
    appointments = demoAppointments.map((item) => ({ ...item, facilityName: item.facilityName, reminderStatus: item.reminderStatus }));
  }
  return <AppShell user={user}>
    <PageTitle eyebrow="Perawatan terjadwal" title="Jadwal ANC" description="Pantau jadwal pemeriksaan antenatal care Anda." />
    {!live && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Jadwal contoh untuk demo.</p>}
    {appointmentsError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Jadwal ANC gagal dimuat: {appointmentsError}</p>}
    <div className="space-y-4">{appointments.length ? appointments.map((item) => {
      const id = item._id ?? item.id ?? "";
      return <Card key={id || item.scheduledAt} className="transition hover:border-brand"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div className="flex gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-mint text-brand"><CalendarDays /></div><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-black">{item.visitType ?? "Kunjungan ANC"}</h2><StatusBadge status={item.status} /></div><div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-3 sm:gap-5"><span className="flex items-center gap-2"><Clock3 className="size-4 text-brand" />{formatDateTime(item.scheduledAt)} WIB</span><span className="flex items-center gap-2"><MapPin className="size-4 text-brand" />{item.facilityName ?? item.facilityId ?? "Fasilitas sesuai jadwal"}</span><span className="flex items-center gap-2"><Clock3 className="size-4 text-brand" />Pengingat: {item.reminderStatus ?? "Dijadwalkan"}</span></div></div></div></div>{live && id && <AppointmentActions id={id} status={item.status} />}</Card>;
    }) : <EmptyState title="Belum ada jadwal ANC" description="Jadwal pemeriksaan yang terhubung dengan akun Anda akan tampil di sini." />}</div>
  </AppShell>;
}

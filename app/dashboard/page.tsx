import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { NakesShell } from "@/components/nakes-shell";
import { Card, StatusBadge } from "@/components/ui";
import { DemoBanner, Metric, TimeLabel } from "@/components/nakes-ui";
import { todayAppointments } from "@/lib/nakes-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { BackendUnavailable } from "@/components/backend-unavailable";

type DashboardSummary = {
  patients: number;
  appointments: { total: number; today: number; upcoming: number; completed: number; missed: number };
  risk?: { elevated: number; followUp: number; awaitingAssessment: number };
  trimesterDistribution?: { trimester1: number; trimester2: number; trimester3: number; unknown: number };
  monthlyAppointments?: Array<{ month: string; total: number; completed?: number }>;
};
type Appointment = { _id: string; scheduledAt: string; status: string; visitType?: string; patientId: string };
type Patient = { userId: string; patient?: { fullName?: string } };
type PageData<T> = { data: T[]; meta?: { total: number } };

const demoTrend = [
  { month: "Jan", total: 13, completed: 10 }, { month: "Feb", total: 16, completed: 12 },
  { month: "Mar", total: 18, completed: 13 }, { month: "Apr", total: 21, completed: 16 },
  { month: "Mei", total: 23, completed: 18 }, { month: "Jun", total: 26, completed: 21 },
];

export default async function DashboardPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (error instanceof TypeError && /fetch failed|network/i.test(error.message)) return <BackendUnavailable />;
    throw error;
  }
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [summary, appointments, patients] = live
    ? await Promise.all([
        serverApi<DashboardSummary>("/dashboard/summary").catch(() => null),
        serverApi<PageData<Appointment>>("/dashboard/appointments?limit=5").catch(() => ({ data: [] })),
        serverApi<PageData<Patient>>("/dashboard/patients?limit=100").catch(() => ({ data: [] })),
      ])
    : [null, null, null];
  const patientNames = new Map((patients?.data ?? []).map((item) => [item.userId, item.patient?.fullName ?? "Pasien"]));
  const rows = live
    ? (appointments?.data ?? []).map((item) => ({
        id: item._id,
        time: new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(item.scheduledAt)),
        patient: patientNames.get(item.patientId) ?? "Pasien dalam cakupan Anda",
        type: item.visitType ?? "Kunjungan ANC",
        status: item.status,
      }))
    : todayAppointments.map((item, index) => ({ id: `${item.time}-${index}`, ...item, status: "confirmed" }));
  const trend = summary?.monthlyAppointments?.map((item) => ({ month: item.month, total: item.total, completed: item.completed ?? 0 })) ?? (live ? [] : demoTrend);
  const distribution = summary?.trimesterDistribution ?? (live ? null : { trimester1: 43, trimester2: 50, trimester3: 31, unknown: 0 });
  const patientCount = summary?.patients ?? (live ? null : 124);
  const riskCount = summary?.risk ? summary.risk.elevated + summary.risk.followUp : live ? null : 8;
  const todayCount = summary?.appointments.today ?? (live ? null : 28);
  const distributionTotal = distribution ? distribution.trimester1 + distribution.trimester2 + distribution.trimester3 + distribution.unknown : 0;
  const trimesterSlices = distribution ? [
    { label: "Trimester 1", value: distribution.trimester1, color: "#38bdf8" },
    { label: "Trimester 2", value: distribution.trimester2, color: "#ec4899" },
    { label: "Trimester 3", value: distribution.trimester3, color: "#a78bfa" },
    { label: "Belum tercatat", value: distribution.unknown, color: "#cbd5e1" },
  ] : [];
  let sliceEnd = 0;
  const donutStops = trimesterSlices.map((slice) => {
    const start = sliceEnd;
    sliceEnd += distributionTotal ? slice.value / distributionTotal * 100 : 0;
    return `${slice.color} ${start}% ${sliceEnd}%`;
  }).join(", ");
  const maxTrend = Math.max(1, ...trend.map((item) => item.total));

  return <NakesShell user={user}>
    {!live && <DemoBanner>Angka pada dashboard ini adalah data contoh, bukan data layanan sebenarnya.</DemoBanner>}
    <section className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-blue-50/70 to-pink-50/70 px-6 py-6 lg:px-8">
      <div><h1 className="text-2xl font-extrabold text-slate-900">Selamat pagi, {user.fullName}! <span aria-hidden>👋</span></h1><p className="mt-2 text-sm text-slate-500">Berikut ringkasan pelayanan maternal & pemantauan risiko preeklamsia hari ini.</p></div>
      <div className="flex flex-wrap gap-3"><Link href="/dashboard/pasien" className="rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Pilih Pasien (Cek RM)</Link><Link href="/dashboard/jadwal" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">Lihat Jadwal Hari Ini <ArrowRight className="size-4" /></Link></div>
    </section>
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <Metric label="Total Ibu Hamil" value={patientCount === null ? "—" : String(patientCount)} note={live ? "Pasien dalam cakupan Anda" : "+12% dari bulan lalu · Klik untuk pilih RM pasien"} />
      <Metric label="Kunjungan Hari Ini" value={todayCount === null ? "—" : String(todayCount)} note={live ? "Jadwal ANC hari ini" : "12 ANC · 8 konsultasi · 8 USG"} tone="blue" />
      <Metric label="Pantauan Risiko Tinggi & Preeklamsia" value={riskCount === null ? "—" : String(riskCount)} note={summary?.risk ? `${summary.risk.elevated} risiko meningkat · ${summary.risk.followUp} perlu tindak lanjut` : live ? "Dari asesmen terakhir" : "3 waspada preeklamsia (MAP ≥ 90)"} tone="rose" />
    </div>
    <div className="grid gap-5 xl:grid-cols-12">
      <Card className="xl:col-span-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-extrabold text-slate-800">Tren Kunjungan ANC</h2><p className="mt-1 text-xs text-slate-400">{live ? "6 bulan terakhir" : "Jan – Jun 2025 · Data contoh"}</p></div><Link href="/dashboard/laporan" className="text-xs font-bold text-blue-700 hover:underline">Laporan lengkap</Link></div>
        {trend.length ? <div className="mt-7 flex h-64 items-end justify-around gap-3 border-b border-slate-100 px-2 sm:gap-5">{trend.map((item) => { const totalHeight = Math.max(4, item.total / maxTrend * 100); const completedHeight = Math.max(3, (item.completed / maxTrend) * 100); const label = item.month.length === 7 ? item.month.slice(5) : item.month; return <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1.5"><div title={`${item.completed} kunjungan selesai`} className="w-4 rounded-t-md bg-sky-400 sm:w-5" style={{ height: `${completedHeight}%` }} /><div title={`${item.total} total kunjungan`} className="w-4 rounded-t-md bg-pink-400 sm:w-5" style={{ height: `${totalHeight}%` }} /></div><span className="pb-2 text-[10px] font-medium text-slate-500">{label}</span></div>; })}</div> : <div className="grid h-64 place-items-center text-sm text-slate-500">Belum ada data kunjungan pada enam bulan terakhir.</div>}
        <div className="mt-3 flex justify-center gap-5 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-2"><i className="size-2.5 rounded-sm bg-pink-400" />Total kunjungan</span><span className="flex items-center gap-2"><i className="size-2.5 rounded-sm bg-sky-400" />Selesai</span></div>
      </Card>
      <Card className="xl:col-span-5"><div className="flex items-center justify-between"><h2 className="text-base font-extrabold text-slate-800">Distribusi Trimester</h2><span className="text-xs text-slate-400">{patientCount ?? 0} ibu</span></div>
        {distribution ? <div className="mt-5 grid items-center gap-5 sm:grid-cols-[190px_1fr] xl:grid-cols-1 2xl:grid-cols-[190px_1fr]"><div className="mx-auto grid size-44 place-items-center rounded-full" style={{ background: `conic-gradient(${donutStops || "#e2e8f0 0% 100%"})` }} role="img" aria-label="Diagram donat distribusi trimester"><div className="grid size-24 place-items-center rounded-full bg-white text-center"><div><p className="text-xl font-black text-slate-900">{patientCount ?? distributionTotal}</p><p className="text-[10px] font-semibold text-slate-500">Ibu hamil</p></div></div></div><div className="space-y-3">{trimesterSlices.map((slice) => { const share = distributionTotal ? Math.round(slice.value / distributionTotal * 100) : 0; return <div key={slice.label} className="flex items-center gap-2 text-xs"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} /><span className="flex-1 text-slate-600">{slice.label}</span><span className="font-extrabold text-slate-900">{share}%</span><span className="w-8 text-right text-slate-400">{slice.value}</span></div>; })}</div></div> : <div className="grid h-52 place-items-center text-sm text-slate-500">Distribusi trimester belum tersedia.</div>}
      </Card>
    </div>
    <Card className="mt-5"><div className="mb-2 flex items-center justify-between"><div><h2 className="text-base font-extrabold text-slate-800">Jadwal ANC Terdekat</h2><p className="mt-1 text-xs text-slate-500">Pantau pasien yang perlu dilayani berikutnya.</p></div><Link href="/dashboard/jadwal" className="text-sm font-bold text-blue-700 hover:underline">Lihat semua</Link></div>
      {rows.length ? <div className="divide-y divide-slate-100">{rows.map((item) => <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={item.id}><div className="flex items-center gap-3"><TimeLabel>{item.time}</TimeLabel><div><p className="font-bold text-slate-800">{item.patient}</p><p className="text-xs text-slate-500">{item.type}</p></div></div><StatusBadge status={item.status} /></div>)}</div> : <div className="flex items-center gap-3 py-6 text-sm text-slate-500"><CalendarDays className="size-5 text-slate-400" />Belum ada jadwal dalam cakupan Anda.</div>}
    </Card>
  </NakesShell>;
}

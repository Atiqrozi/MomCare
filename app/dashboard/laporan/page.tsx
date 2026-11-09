import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner, Metric } from "@/components/nakes-ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Summary = {
  patients: number;
  appointments: { total: number; today: number; upcoming: number; completed: number; missed: number };
  risk?: { elevated: number; followUp: number; awaitingAssessment: number };
  trimesterDistribution?: { trimester1: number; trimester2: number; trimester3: number; unknown: number };
  monthlyAppointments?: Array<{ month: string; total: number }>;
};

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const summary = live ? await serverApi<Summary>("/dashboard/summary").catch(() => null) : null;
  const months = summary?.monthlyAppointments ?? [];
  const maxMonth = Math.max(1, ...months.map((item) => item.total));
  const trimesterRows = summary?.trimesterDistribution ? [
    ["Trimester 1", summary.trimesterDistribution.trimester1, "bg-sky-400"],
    ["Trimester 2", summary.trimesterDistribution.trimester2, "bg-pink-400"],
    ["Trimester 3", summary.trimesterDistribution.trimester3, "bg-violet-400"],
    ["HPHT belum dicatat", summary.trimesterDistribution.unknown, "bg-slate-300"],
  ] as const : [];

  return <NakesShell user={user}>
    <PageTitle eyebrow="Ringkasan layanan" title="Laporan & Statistik" description="Pantau kunjungan, distribusi kehamilan, dan tindak lanjut risiko dalam cakupan fasilitas Anda." />
    {live ? summary ? <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Pasien terdaftar" value={String(summary.patients)} note="Dalam cakupan Anda" />
        <Metric label="Jadwal hari ini" value={String(summary.appointments.today)} note="Semua kunjungan" tone="blue" />
        <Metric label="Kunjungan selesai" value={String(summary.appointments.completed)} note="Semua periode" tone="teal" />
        <Metric label="Jadwal mendatang" value={String(summary.appointments.upcoming)} note="Perlu dipersiapkan" tone="blue" />
        <Metric label="Jadwal terlewat" value={String(summary.appointments.missed)} note="Perlu tindak lanjut" tone="amber" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7"><div className="flex items-center justify-between"><h2 className="font-black">Tren kunjungan ANC</h2><span className="text-xs text-slate-400">6 bulan terakhir</span></div>
          {months.length ? <div className="mt-6 flex h-56 items-end justify-around gap-3 border-b border-slate-100 px-2">{months.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-slate-600">{item.total}</span><div className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-blue-600 to-sky-400" style={{ height: `${Math.max(3, item.total / maxMonth * 100)}%` }} /><span className="text-xs text-slate-500">{new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" }).format(new Date(`${item.month}-01T12:00:00+07:00`))}</span></div>)}</div> : <p className="py-14 text-center text-sm text-slate-500">Belum ada kunjungan pada enam bulan terakhir.</p>}
        </Card>
        <Card className="xl:col-span-5"><h2 className="font-black">Distribusi usia kehamilan</h2>
          {trimesterRows.length ? <div className="mt-5 space-y-5">{trimesterRows.map(([label, value, color]) => { const count = Number(value); const share = summary.patients ? Math.round(count / summary.patients * 100) : 0; return <div key={label}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold text-slate-600">{label}</span><b>{count} <span className="font-normal text-slate-400">({share}%)</span></b></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${share}%` }} /></div></div>; })}</div> : <p className="mt-4 text-sm text-slate-500">Data usia kehamilan belum tersedia.</p>}
        </Card>
      </div>
      <Card className="mt-5"><h2 className="font-black">Ringkasan skrining risiko</h2><p className="mt-1 text-sm text-slate-500">Mengacu pada asesmen terakhir yang tersimpan untuk setiap pasien.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><RiskTile label="Risiko meningkat / tinggi" value={summary.risk?.elevated ?? 0} color="rose" /><RiskTile label="Perlu tindak lanjut" value={summary.risk?.followUp ?? 0} color="amber" /><RiskTile label="Belum ada asesmen" value={summary.risk?.awaitingAssessment ?? 0} color="slate" /></div></Card>
    </> : <Card><p className="text-sm text-slate-600">Ringkasan backend belum dapat dimuat. Periksa koneksi API dan cakupan akses akun Anda.</p></Card> : <>
      <DemoBanner>Angka berikut hanya contoh prototype, bukan laporan resmi fasilitas.</DemoBanner>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Kunjungan ANC" value="248" note="Contoh" /><Metric label="Cakupan K1" value="92%" note="Contoh" tone="blue" /><Metric label="Rujukan" value="6" note="Contoh" tone="amber" /><Metric label="Follow-up" value="87%" note="Contoh" tone="rose" /></div>
    </>}
  </NakesShell>;
}

function RiskTile({ label, value, color }: { label: string; value: number; color: "rose" | "amber" | "slate" }) {
  const colors = { rose: "bg-rose-50 text-rose-700", amber: "bg-amber-50 text-amber-800", slate: "bg-slate-100 text-slate-700" };
  return <div className={`rounded-xl p-4 ${colors[color]}`}><p className="text-sm font-semibold">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}

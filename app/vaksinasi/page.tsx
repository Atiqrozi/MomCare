import { Syringe } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import type { PageResult } from "@/lib/types";

type Vaccination = { _id: string; vaccineName: string; scheduledDate?: string; administeredDate?: string; status: string; verificationNote?: string };

export default async function VaccinationPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const result = live ? await serverApi<PageResult<Vaccination>>("/pregnancy/vaccinations?limit=100").catch(() => ({ data: [] })) : null;
  const vaccinations = result?.data ?? [];
  const date = (value?: string) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value)) : "Belum dijadwalkan";
  return <AppShell user={user}>
    <PageTitle eyebrow="Perlindungan" title="Vaksinasi" description="Lihat status dan jadwal vaksinasi yang dicatat oleh tenaga kesehatan." />
    {!live && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Data vaksinasi dimuat dari backend saat layanan aktif.</p>}
    <div className="space-y-4">{vaccinations.length ? vaccinations.map((item) => <Card key={item._id} className="flex items-center gap-4"><div className="grid size-12 place-items-center rounded-xl bg-mint text-brand"><Syringe /></div><div className="flex-1"><h2 className="font-black">{item.vaccineName}</h2><p className="mt-1 text-sm text-muted">{item.administeredDate ? `Diberikan ${date(item.administeredDate)}` : `Jadwal ${date(item.scheduledDate)}`}</p>{item.verificationNote && <p className="mt-1 text-xs text-muted">Catatan verifikasi: {item.verificationNote}</p>}</div><StatusBadge status={item.status} /></Card>) : <EmptyState title="Belum ada catatan vaksinasi" description="Catatan vaksinasi akan muncul setelah dimasukkan oleh tenaga kesehatan." />}</div>
  </AppShell>;
}

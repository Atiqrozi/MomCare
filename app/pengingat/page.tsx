import { redirect } from "next/navigation";
import { BellRing } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { MedicationReminders } from "@/components/medication-reminders";
import { NotificationRetry } from "@/components/notification-retry";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Notification = { _id: string; appointmentId: string; channel: string; scheduledAt: string; sentAt?: string; status: string; message: string; lastError?: string };
type Reminder = { _id: string; name: string; dosage: string; time: string; notes?: string; active: boolean };
type PageData<T> = { data: T[] };

export default async function ReminderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [reminders, notificationPage] = live ? await Promise.all([
    serverApi<Reminder[]>("/pregnancy/medication-reminders").catch(() => []),
    serverApi<PageData<Notification> | Notification[]>("/notifications?limit=100").catch(() => ({ data: [] })),
  ]) : [[], { data: [] }];
  const notifications = Array.isArray(notificationPage) ? notificationPage : notificationPage?.data ?? [];
  return <AppShell user={user}>
    <PageTitle eyebrow="Pengingat harian" title="Pengingat Obat & Vitamin" description="Atur pengingat pribadi dan pantau pemberitahuan jadwal ANC dari fasilitas kesehatan." />
    {!live && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Aktifkan backend untuk menyimpan pengingat di akun Anda.</p>}
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <Card><MedicationReminders initial={reminders} /></Card>
      <section><h2 className="mb-3 text-lg font-black text-slate-900">Notifikasi jadwal ANC</h2>{notifications.length ? <div className="space-y-3">{notifications.map((item) => <Card key={item._id} className="flex flex-wrap items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><BellRing className="size-5" /></span><div className="min-w-40 flex-1"><p className="text-sm font-bold">{item.message}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.scheduledAt))} WIB · {item.channel}</p>{item.lastError && <p className="mt-1 text-xs text-red-600">{item.lastError}</p>}</div><StatusBadge status={item.status} />{item.status === "failed" && <NotificationRetry id={item._id} />}</Card>)}</div> : <EmptyState title="Belum ada notifikasi ANC" description="Pengingat jadwal akan tercatat setelah fasilitas membuat jadwal pemeriksaan." />}</section>
    </div>
  </AppShell>;
}

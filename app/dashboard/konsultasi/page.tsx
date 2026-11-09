import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { getCurrentUser } from "@/lib/session";
import { StaffChatInbox } from "@/components/staff-clinical-tools";

export default async function ConsultationPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  return <NakesShell user={user}><PageTitle eyebrow="Komunikasi pasien" title="Konsultasi" description="Ruang konsultasi pasien dan tenaga kesehatan." />{live ? <StaffChatInbox /> : <><DemoBanner>Percakapan berikut hanya contoh tampilan. Chat real-time belum tersedia.</DemoBanner><div className="grid gap-5 lg:grid-cols-[340px_1fr]"><Card className="p-0"><div className="border-b border-slate-100 p-4 font-black">Contoh percakapan</div>{["Alya Pratama", "Siti Rahma", "Dewi Lestari"].map((name, index) => <div className={`border-b border-slate-100 p-4 ${index === 0 ? "bg-teal-50" : ""}`} key={name}><p className="font-bold">{name}</p><p className="mt-1 truncate text-xs text-slate-500">Contoh pesan untuk prototype</p></div>)}</Card><Card><h2 className="font-black">Pratinjau konsultasi</h2><div className="flex h-64 items-center justify-center text-center text-sm text-slate-400">Pesan demo tidak dikirim atau disimpan.</div><div className="flex gap-2"><input className="field" placeholder="Segera hadir" disabled /><button disabled className="rounded-xl bg-slate-200 px-4 text-sm font-bold text-slate-400">Kirim</button></div></Card></div></>}</NakesShell>;
}

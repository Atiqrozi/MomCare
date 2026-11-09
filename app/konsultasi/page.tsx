import { AppShell } from "@/components/app-shell";
import { ChatAssistant } from "@/components/chat-assistant";
import { Card, ClinicalDisclaimer, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";

export default async function ConsultationPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  return <AppShell user={user}><PageTitle eyebrow="Pendamping digital" title="Konsultasi" description="Tanya informasi umum dan siapkan pertanyaan sebelum kunjungan ANC." /><ClinicalDisclaimer />{live ? <ChatAssistant /> : <Card className="mt-6 max-w-3xl"><h2 className="font-black">Konsultasi MomCare</h2><p className="mt-2 text-sm text-muted">Percakapan tersimpan dan balasan AI tersedia dalam mode backend. Aktifkan koneksi backend untuk mencobanya.</p></Card>}</AppShell>;
}

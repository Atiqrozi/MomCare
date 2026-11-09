import { AppShell } from "@/components/app-shell";
import { ClinicalDisclaimer, PageTitle } from "@/components/ui";
import { JournalForm } from "@/components/forms";
import { getCurrentUser } from "@/lib/session";

export default async function NewJournalPage() {
  const user = await getCurrentUser(); if (!user) return null;
  return <AppShell user={user}><PageTitle eyebrow="Jurnal pribadi" title="Tulis jurnal baru" description="Simpan catatan yang ingin Anda ingat dari hari ini." /><ClinicalDisclaimer /><div className="mt-6"><JournalForm /></div></AppShell>;
}

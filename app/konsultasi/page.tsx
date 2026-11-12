import { AppShell } from "@/components/app-shell";
import { PatientConsultation } from "@/components/patient-consultation";
import { Card, ClinicalDisclaimer, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";

export default async function ConsultationPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  return <AppShell user={user}><PageTitle eyebrow="Pendamping digital" title="Konsultasi" description="Tanya AI atau hubungi tenaga kesehatan yang menangani Bunda." /><ClinicalDisclaimer />{live ? <PatientConsultation /> : <Card className="mt-6 max-w-3xl"><h2 className="font-black">Konsultasi MomCare</h2><p className="mt-2 text-sm text-muted">Aktifkan backend untuk menggunakan chat AI dan pesan tenaga kesehatan.</p></Card>}</AppShell>;
}

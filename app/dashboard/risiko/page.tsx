import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { RiskScreening } from "@/components/staff-clinical-tools";
import { getCurrentUser } from "@/lib/session";

export default async function RiskPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  return <NakesShell user={user}><PageTitle eyebrow="Pemantauan klinis" title="Risiko & Preeklampsia" description="Skrining pendukung dari pengukuran yang dicatat tenaga kesehatan; hasil perlu ditinjau secara klinis." />{live ? <RiskScreening /> : <><DemoBanner>Data contoh prototipe. Jangan digunakan untuk keputusan klinis.</DemoBanner><Card><h2 className="font-black">Contoh tampilan pemantauan</h2><p className="mt-2 text-sm text-slate-500">Gunakan mode live untuk menyimpan hasil skrining melalui backend.</p></Card></>}</NakesShell>;
}

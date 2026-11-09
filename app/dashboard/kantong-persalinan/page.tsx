import { NakesShell } from "@/components/nakes-shell";
import { PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { LaborBagConsole, type LaborBagData } from "@/components/labor-bag-console";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { redirect } from "next/navigation";

const emptyData: LaborBagData = { entries: [], patients: [], providers: [] };

export default async function LaborBagPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!["DOCTOR", "MIDWIFE", "ADMIN"].includes(user.role)) redirect("/dashboard");
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const result = live ? await serverApi<LaborBagData>("/dashboard/labor-bag").catch(() => emptyData) : emptyData;
  return <NakesShell user={user}>
    <PageTitle eyebrow="Persiapan persalinan" title="Kantong Persalinan" description="Kelola daftar pasien yang direncanakan menjalani persalinan di fasilitas ini, beserta HPL, penjamin, jenis persalinan, dan DPJP." />
    {!live && <DemoBanner>Data Kantong Persalinan tersedia saat backend aktif (NEXT_PUBLIC_ENABLE_MOCKS=false).</DemoBanner>}
    <LaborBagConsole initialData={result} />
  </NakesShell>;
}

import { getCurrentUser } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/ui";
import { HpkJourney } from "@/components/hpk-journey";
import { serverApi } from "@/lib/api";

type Child = { _id: string; fullName: string; birthDate: string; sex: "male" | "female" | "unspecified"; notes?: string };
type Growth = { _id: string; measuredAt: string; weightKg: number; heightCm: number; headCircumferenceCm?: number; notes?: string };
type GrowthResult = { child: { _id: string } | null; data: Growth[] };
type Immunization = { _id: string; vaccineName: string; scheduledDate?: string; administeredDate?: string; status: string; notes?: string };

export default async function HpkPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [child, growth, immunizations] = live ? await Promise.all([
    serverApi<Child | null>("/pregnancy/children/profile").catch(() => null),
    serverApi<GrowthResult>("/pregnancy/children/growth").catch(() => ({ child: null, data: [] })),
    serverApi<Immunization[]>("/pregnancy/children/immunizations").catch(() => []),
  ]) : [null, { child: null, data: [] }, []];
  return <AppShell user={user}>
    <PageTitle eyebrow="Pendampingan keluarga" title="Tumbuh Kembang Anak · 1000 HPK" description="Panduan imunisasi, pemantauan pertumbuhan, nutrisi, dan stimulasi pada dua tahun pertama kehidupan." />
    <HpkJourney initialChild={child} initialGrowth={growth.data} initialImmunizations={immunizations} live={live} />
  </AppShell>;
}

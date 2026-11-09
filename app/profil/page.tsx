import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/ui";
import { MotherProfile } from "@/components/mother-profile";
import { ProfileSettings } from "@/components/profile-settings";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Profile = {
  nik?: string; insuranceType?: "BPJS" | "UMUM"; bpjsNumber?: string; birthplace?: string; birthDate?: string;
  education?: string; occupation?: string; address?: string; bloodType?: string; medicalHistory?: string;
  lmpDate?: string; estimatedDueDate?: string; pregnancyStatus?: string;
};
type Timeline = { currentWeek: number | null; profile: Profile | null };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [profile, timeline] = live ? await Promise.all([
    serverApi<Profile | null>("/pregnancy/profile").catch(() => null),
    serverApi<Timeline>("/pregnancy/timeline").catch(() => null),
  ]) : [null, null];
  const pregnancyProfile = profile ?? timeline?.profile ?? null;
  return <AppShell user={user}>
    <PageTitle eyebrow="Profil ibu" title="Profil Saya" description="Informasi identitas, pembiayaan, dan ringkasan kehamilan Anda." />
    <MotherProfile user={user} profile={pregnancyProfile} live={live} />
    <section className="mt-8 border-t border-line pt-7"><h2 className="mb-4 text-xl font-black">Akun & keamanan</h2><ProfileSettings user={user} /></section>
  </AppShell>;
}

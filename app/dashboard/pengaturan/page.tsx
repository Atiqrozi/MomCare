import { NakesShell } from "@/components/nakes-shell";
import { PageTitle } from "@/components/ui";
import { DemoBanner } from "@/components/nakes-ui";
import { ProfileSettings } from "@/components/profile-settings";
import { getCurrentUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  return <NakesShell user={user}>
    <PageTitle eyebrow="Workspace" title="Pengaturan" description="Kelola profil akun dan keamanan akses tenaga kesehatan." />
    {live ? <ProfileSettings user={user} /> : <>
      <DemoBanner>Mode demo tidak menyimpan perubahan profil. Pengaturan akan memakai akun aktif saat backend digunakan.</DemoBanner>
      <div className="grid max-w-3xl gap-5">{[
        ["Profil tenaga kesehatan", "Nama, nomor telepon, dan email akun"],
        ["Keamanan akun", "Perubahan kata sandi dan verifikasi kontak"],
      ].map(([title, description]) => <section key={title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p><p className="mt-4 text-sm font-semibold">{title === "Profil tenaga kesehatan" ? user.fullName : "Data akun tersimpan saat login"}</p></section>)}</div>
    </>}
  </NakesShell>;
}

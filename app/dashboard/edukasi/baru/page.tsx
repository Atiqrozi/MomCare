import Link from "next/link";
import { redirect } from "next/navigation";
import { NakesShell } from "@/components/nakes-shell";
import { Card, PageTitle } from "@/components/ui";
import { EducationCreateForm } from "@/components/education-create-form";
import { getCurrentUser } from "@/lib/session";

export default async function NewEducationPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "CONTENT_EDITOR") redirect("/dashboard/edukasi");
  return <NakesShell user={user}><Link href="/dashboard/edukasi" className="text-sm font-bold text-teal-700">← Kembali ke edukasi</Link><PageTitle eyebrow="Konten baru" title="Buat draf materi" description="Setelah disimpan, ajukan materi untuk ditinjau tenaga kesehatan sebelum diterbitkan." /><Card><EducationCreateForm /></Card></NakesShell>;
}

import { redirect } from "next/navigation";
import { NakesShell } from "@/components/nakes-shell";
import { PageTitle } from "@/components/ui";
import { HospitalServiceConsole } from "@/components/hospital-service-console";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type Service = { _id: string; name: string; slug: string; description: string; department: string; addressOrLocation: string; contactPhone?: string; operatingHours?: string; instructions?: string; status: string };
type PageData<T> = { data: T[] };

export default async function HospitalServiceManagementPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "ADMIN") redirect("/dashboard");
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const result = live ? await serverApi<PageData<Service> | Service[]>("/hospital-services/internal/list?limit=100").catch(() => []) : { data: [] };
  const services = Array.isArray(result) ? result : result?.data ?? [];
  return <NakesShell user={user}><PageTitle eyebrow="Informasi publik" title="Layanan rumah sakit" description="Buat draf, terbitkan, perbarui, atau arsipkan informasi layanan." />{!live && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Aktifkan backend untuk mengelola data layanan.</div>}<HospitalServiceConsole services={services} /></NakesShell>;
}

import { Clock3, MapPin, Phone, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageTitle } from "@/components/ui";
import { demoServices } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type HospitalService = { _id?: string; id?: string; slug: string; name: string; department: string; description: string; operatingHours?: string; contactPhone?: string; addressOrLocation?: string; instructions?: string };
type PageData<T> = { data: T[] };

export default async function HospitalServicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const result = live ? await serverApi<PageData<HospitalService>>("/hospital-services?limit=100").catch(() => ({ data: [] })) : null;
  const services: HospitalService[] = live ? result?.data ?? [] : demoServices.map((item) => ({ slug: item.slug, name: item.name, department: item.department, description: item.description, operatingHours: item.hours, contactPhone: item.phone, addressOrLocation: item.location }));
  return <AppShell user={user}>
    <PageTitle eyebrow="Informasi fasilitas" title="Layanan rumah sakit" description="Temukan layanan dan informasi kontak yang tersedia dari fasilitas kesehatan." />
    {!live && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Informasi layanan contoh untuk demo.</p>}
    {services.length ? <div className="grid gap-5 md:grid-cols-2">{services.map((service) => <Card key={service._id ?? service.slug}><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-mint text-brand"><ShieldCheck /></div><span className="text-xs font-bold text-brand">{service.department}</span></div><h2 className="mt-5 text-xl font-black">{service.name}</h2><p className="mt-2 leading-7 text-muted">{service.description}</p>{service.instructions && <p className="mt-3 text-sm text-muted">{service.instructions}</p>}<div className="mt-5 space-y-3 border-t border-line pt-4 text-sm text-muted">{service.operatingHours && <p className="flex gap-2"><Clock3 className="size-4 text-brand" />{service.operatingHours}</p>}{service.addressOrLocation && <p className="flex gap-2"><MapPin className="size-4 text-brand" />{service.addressOrLocation}</p>}{service.contactPhone && <a href={`tel:${service.contactPhone}`} className="flex gap-2 font-bold text-brand"><Phone className="size-4" />{service.contactPhone}</a>}</div></Card>)}</div> : <EmptyState title="Layanan belum tersedia" description="Informasi layanan yang sudah diterbitkan akan muncul di sini." />}
  </AppShell>;
}

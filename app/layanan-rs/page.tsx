import Link from "next/link";
import { BadgeCheck, Building2, CalendarDays, ClipboardList, Clock3, ExternalLink, MapPin, Phone, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageTitle } from "@/components/ui";
import { PatientCoverageCard } from "@/components/patient-coverage-card";
import { demoServices } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type HospitalService = { _id?: string; id?: string; slug: string; name: string; department: string; description: string; operatingHours?: string; contactPhone?: string; addressOrLocation?: string; instructions?: string };

type QuickService = { title: string; description: string; icon: LucideIcon; tone: "pink" | "blue" | "green" | "yellow" | "teal"; href?: string; external?: boolean };

const quickServices: QuickService[] = [
  { title: "11 Poliklinik & Homecare", description: "Lihat layanan poliklinik dan homecare rumah sakit.", icon: ShieldCheck, tone: "pink", href: "#layanan-publik" },
  { title: "Pendaftaran Online", description: "Daftar kunjungan melalui sistem antrean online.", icon: ClipboardList, tone: "blue", href: "https://antrian.puraraharja.com/", external: true },
  { title: "Jadwal Dokter", description: "Periksa jadwal praktik dokter rumah sakit.", icon: CalendarDays, tone: "blue", href: "https://puraraharja.com/dokter/", external: true },
  { title: "Fasilitas", description: "Lihat fasilitas yang tersedia di RS KORPRI Pura Raharja.", icon: Building2, tone: "green", href: "https://puraraharja.com/fasilitas/", external: true },
  { title: "Hubungi Kami", description: "Hubungi RS KORPRI Pura Raharja melalui WhatsApp.", icon: Phone, tone: "yellow", href: "https://api.whatsapp.com/send/?phone=6288805028175&text&type=phone_number&app_absent=0", external: true },
  { title: "Pasien Umum & BPJS/JKN", description: "Informasi layanan untuk pasien umum dan peserta BPJS/JKN.", icon: BadgeCheck, tone: "teal" },
];

const clinics = [
  { name: "Klinik Spesialis Obsgyn", href: "https://puraraharja.com/layanan/klinik-spesialis-kandungan-obgyn/" },
  { name: "Klinik Spesialis Anak", href: "https://puraraharja.com/layanan/klinik-spesialis-anak/" },
  { name: "Klinik Spesialis Penyakit Dalam", href: "https://puraraharja.com/layanan/klinik-spesialis-penyakit-dalam/" },
  { name: "Klinik Spesialis Gigi", href: "https://puraraharja.com/layanan/klinik-spesialis-gigi/" },
  { name: "Klinik Spesialis Bedah Umum", href: "https://puraraharja.com/klinik-spesialis-bedah-umum/" },
  { name: "Klinik Spesialis Jantung", href: "https://puraraharja.com/klinik-spesialis-jantung/" },
  { name: "Klinik Spesialis Rehabilitasi Medik", href: "https://puraraharja.com/klinik-spesialis-rehabilitasi-medik/" },
  { name: "Klinik Spesialis Mata", href: "https://puraraharja.com/klinik-spesialis-mata/" },
  { name: "Klinik Gizi", href: "https://puraraharja.com/layanan/klinik-spesialis-gizi/" },
  { name: "Klinik BKIA", href: "https://puraraharja.com/klinik-bkia/" },
  { name: "Layanan Homecare", href: "https://puraraharja.com/layanan/layanan-homecare/" },
];

const toneStyles = {
  pink: "bg-pink-50 text-pink-600",
  blue: "bg-sky-50 text-sky-600",
  green: "bg-emerald-50 text-emerald-600",
  yellow: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600",
};

export default async function HospitalServicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  let services: HospitalService[] = [];
  if (live) {
    const response = await serverApi<HospitalService[]>("/hospital-services?limit=100").catch(() => []);
    services = Array.isArray(response) ? response : [];
  } else {
    services = demoServices.map((item) => ({ slug: item.slug, name: item.name, department: item.department, description: item.description, operatingHours: item.hours, contactPhone: item.phone, addressOrLocation: item.location }));
  }

  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Jl.+Pucang+Adi+No.12-14%2C+Kertajaya%2C+Kec.+Gubeng%2C+Surabaya%2C+Jawa+Timur+60282";
  return <AppShell user={user}>
    <PageTitle eyebrow="Informasi fasilitas" title="Layanan rumah sakit" description="Akses layanan dan informasi RS KORPRI Pura Raharja." />

    <Card className="mb-6 overflow-hidden border-sky-100 bg-white p-0">
      <div className="grid md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex min-h-40 items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-50 p-8">
          <div className="grid size-24 place-items-center rounded-3xl bg-white/80 text-sky-600 shadow-sm"><Building2 className="size-14" strokeWidth={1.5} /></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 md:min-w-[390px] md:p-8">
          <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">Fasilitas kesehatan</p><h2 className="mt-2 text-xl font-black text-slate-900">RS KORPRI Pura Raharja</h2><p className="mt-2 flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 size-4 shrink-0 text-pink-500" /><span>Jl. Pucang Adi No.12-14, Kertajaya, Kec. Gubeng, Surabaya, Jawa Timur 60282</span></p></div>
          <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-100">Lihat peta <ExternalLink className="size-4" /></a>
        </div>
      </div>
    </Card>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quickServices.map(({ title, description, icon: Icon, tone, href, external }) => {
        if (title === "Pasien Umum & BPJS/JKN") return <PatientCoverageCard key={title} />;
        const content = <><span className={`grid size-14 place-items-center rounded-2xl ${toneStyles[tone]}`}><Icon className="size-7" /></span><h2 className="mt-4 text-base font-black text-slate-800">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>{href && <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-pink-600">{external ? "Buka layanan" : "Lihat layanan"}<ExternalLink className="size-4" /></span>}</>;
        return <Card key={title} className={`h-full border-slate-100 p-5 transition ${href ? "hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md" : ""}`}>
          {href ? href.startsWith("http") ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="block h-full">{content}</a> : <Link href={href} className="block h-full">{content}</Link> : <div className="h-full">{content}<span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Informasi sementara</span></div>}
        </Card>;
      })}
    </div>

    <section id="layanan-publik" className="mt-10"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-widest text-pink-500">Poliklinik & homecare</p><h2 className="mt-1 text-2xl font-black text-slate-900">11 Poliklinik & Homecare</h2><p className="mt-2 text-sm text-slate-500">Pilih layanan untuk melihat informasi lengkap dari RS KORPRI Pura Raharja.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{clinics.map((clinic) => <a key={clinic.name} href={clinic.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pink-50 text-pink-600"><Stethoscope className="size-5" /></span><h3 className="flex-1 text-sm font-bold leading-5 text-slate-800">{clinic.name}</h3><ExternalLink className="size-4 shrink-0 text-pink-500" /></a>)}</div></section>

    {services.length > 0 && <section className="mt-10"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-widest text-pink-500">Informasi layanan</p><h2 className="mt-1 text-2xl font-black text-slate-900">Informasi tambahan</h2></div><div className="grid gap-4 md:grid-cols-2">{services.map((service) => <Card key={service._id ?? service.slug}><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-pink-50 text-pink-600"><Stethoscope /></span><span className="text-xs font-bold text-pink-600">{service.department}</span></div><h3 className="mt-4 text-lg font-black">{service.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p>{service.instructions && <p className="mt-3 text-sm text-slate-600">{service.instructions}</p>}<div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">{service.operatingHours && <p className="flex items-center gap-2"><Clock3 className="size-4 text-pink-500" />{service.operatingHours}</p>}{service.addressOrLocation && <p className="flex items-center gap-2"><MapPin className="size-4 text-pink-500" />{service.addressOrLocation}</p>}{service.contactPhone && <a href={`tel:${service.contactPhone}`} className="flex items-center gap-2 font-bold text-pink-600"><Phone className="size-4" />{service.contactPhone}</a>}</div></Card>)}</div></section>}
  </AppShell>;
}

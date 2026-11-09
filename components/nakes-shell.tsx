"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, Bell, CalendarDays, ChevronDown, FileBarChart, HeartPulse, Home, LogOut, Menu, MessageCircle, Settings, ShieldAlert, Users, X, UserCog, Building2, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { roleLabels } from "@/lib/constants";
import type { User } from "@/lib/types";
import { ACTIVE_PATIENT_EVENT, ACTIVE_PATIENT_STORAGE_KEY, clearActivePatient, parseActivePatient, type ActivePatient } from "@/lib/active-patient";

type NavItem = readonly [string, string, LucideIcon];
const links: NavItem[] = [
  ["/dashboard", "Dashboard", Home],
  ["/dashboard/pasien", "Pasien & RM", Users],
  ["/dashboard/kantong-persalinan", "Kantong Persalinan", Baby],
  ["/dashboard/jadwal", "Jadwal ANC", CalendarDays],
  ["/dashboard/konsultasi", "Konsultasi", MessageCircle],
  ["/dashboard/risiko", "Risiko & Preeklamsia", ShieldAlert],
  ["/dashboard/edukasi", "Edukasi", HeartPulse],
  ["/dashboard/laporan", "Laporan", FileBarChart],
];
const settingsLink: NavItem = ["/dashboard/pengaturan", "Pengaturan", Settings];
const adminLink: NavItem = ["/dashboard/administrasi", "Administrasi", UserCog];
const serviceLink: NavItem = ["/dashboard/layanan-rs", "Kelola layanan RS", Building2];

function BrandMark() {
  return <svg viewBox="0 0 100 100" className="h-10 w-10 shrink-0" aria-hidden="true"><defs><linearGradient id="moment-heart-shell" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff5ca8"/><stop offset="100%" stopColor="#38b6ff"/></linearGradient></defs><path d="M50 88C50 88 12 64 12 36 12 20 25 10 38 10 45 10 50 15 50 15 50 15 55 10 62 10 75 10 88 20 88 36 88 64 50 88 50 88Z" fill="url(#moment-heart-shell)"/><circle cx="39" cy="36" r="8.5" fill="white"/><circle cx="60" cy="44" r="6.5" fill="white"/><path d="M27 56C27 47 35 45 43 47 48 48 53 54 53 62H32C28 62 27 59 27 56Z" fill="white"/></svg>;
}

export function NakesShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activePatient, setActivePatientState] = useState<ActivePatient | null>(null);
  const clinical = ["DOCTOR", "MIDWIFE", "ADMIN"].includes(user.role);
  useEffect(() => {
    setActivePatientState(parseActivePatient(window.localStorage.getItem(ACTIVE_PATIENT_STORAGE_KEY)));
    const onPatientChange = (event: Event) => {
      const selected = (event as CustomEvent<ActivePatient | undefined>).detail;
      setActivePatientState(selected ?? parseActivePatient(window.localStorage.getItem(ACTIVE_PATIENT_STORAGE_KEY)));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVE_PATIENT_STORAGE_KEY) setActivePatientState(parseActivePatient(event.newValue));
    };
    window.addEventListener(ACTIVE_PATIENT_EVENT, onPatientChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ACTIVE_PATIENT_EVENT, onPatientChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const editorial = ["CONTENT_EDITOR", "CLINICAL_REVIEWER", "ADMIN"].includes(user.role);
  const nav = [
    ...links.filter(([href]) => href === "/dashboard/edukasi" ? editorial : href === "/dashboard/konsultasi" || href === "/dashboard/risiko" || href === "/dashboard/laporan" ? clinical : true),
    ...(clinical ? [] : []),
    settingsLink,
    ...(user.role === "ADMIN" ? [adminLink, serviceLink] : []),
  ];
  const title = pathname.startsWith("/dashboard/pasien") ? "Daftar Pasien Ibu Hamil" : "Dashboard Tenaga Kesehatan";
  return <div className="min-h-screen bg-[#f7f9fc]">
    <aside className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-sky-100 bg-gradient-to-b from-sky-50 via-white to-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full min-h-0 flex-col p-5">
        <div className="flex items-center justify-between"><Link href="/dashboard" className="flex items-center gap-3"><BrandMark /><div><b className="text-lg tracking-tight text-slate-900"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></b><p className="text-[10px] font-semibold text-slate-400">Maternal Journey Assistant</p></div></Link><button aria-label="Tutup menu" className="lg:hidden" onClick={() => setOpen(false)}><X className="size-5" /></button></div>
        <div className="mt-6 shrink-0 rounded-xl border border-sky-100 bg-white/80 p-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fasilitas aktif</p><p className="mt-1 text-sm font-bold text-slate-800">RS KORPRI Pura Raharja</p><p className="mt-1 text-xs text-slate-500">Poli KIA · Terhubung</p></div>
        <p className="mb-2 mt-5 shrink-0 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu utama</p>
        <nav aria-label="Menu dashboard" className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-3 pr-1 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">{nav.map(([href, label, Icon]) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)); return <Link onClick={() => setOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200" : "text-slate-700 hover:bg-sky-100/80 hover:text-blue-700"}`}><Icon className="size-[19px] shrink-0" />{label}</Link>; })}</nav>
        {clinical && activePatient && <section className="mb-3 shrink-0 rounded-2xl border border-blue-100 bg-blue-50/90 p-3.5" aria-label="Pasien aktif dipilih"><div className="flex items-center justify-between"><p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Pasien aktif dipilih</p><button onClick={clearActivePatient} aria-label="Kosongkan pasien aktif" title="Kosongkan pilihan" className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700"><X className="size-3.5" /></button></div><p className="mt-2 truncate text-sm font-extrabold text-slate-900">{activePatient.name}</p><p className="mt-1 text-xs text-slate-500">{activePatient.gestationalAge}</p><div className="mt-3 grid grid-cols-2 gap-2"><Link href={`/dashboard/anc/baru?patientId=${encodeURIComponent(activePatient.id)}`} onClick={() => setOpen(false)} className="rounded-xl border border-blue-200 bg-white px-2 py-2 text-center text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white">Input ANC</Link><Link href={`/dashboard/pasien/${encodeURIComponent(activePatient.id)}/grafik`} onClick={() => setOpen(false)} className="rounded-xl border border-pink-200 bg-white px-2 py-2 text-center text-xs font-bold text-pink-600 hover:bg-pink-500 hover:text-white">Grafik KIA</Link></div></section>}
        <div className="mt-auto shrink-0 rounded-xl border border-slate-100 bg-white/90 p-3"><p className="truncate text-sm font-bold">{user.fullName}</p><p className="mt-1 text-xs text-slate-500">{roleLabels[user.role]}</p><Link href="/api/auth/logout" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500"><LogOut className="size-3" />Keluar</Link></div>
      </div>
    </aside>
    <div className="lg:pl-80"><header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8"><button aria-label="Buka menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button><div className="hidden text-sm text-slate-500 lg:block"><span className="font-bold text-slate-900">{title}</span><span className="mx-2 text-slate-300">·</span><span>RS KORPRI Pura Raharja</span></div><div className="flex items-center gap-4"><Bell className="size-5 text-slate-500" /><span className="hidden h-7 w-px bg-slate-200 sm:block" /><span className="grid size-10 place-items-center rounded-full border border-pink-200 bg-pink-50 text-sm font-bold text-pink-600">{user.fullName.slice(0, 2)}</span><div className="hidden sm:block"><p className="text-sm font-bold">{user.fullName}</p><p className="text-xs text-blue-600">{roleLabels[user.role]}</p></div><ChevronDown className="size-4 text-slate-400" /></div></header><main className="mx-auto max-w-[1600px] p-5 pb-16 lg:p-7">{children}</main></div>
  </div>;
}

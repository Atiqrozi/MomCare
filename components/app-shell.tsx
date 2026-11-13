"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ClipboardList, FileHeart, HeartPulse, Home, LogOut, ShieldCheck, Syringe, UserRound, Sparkles, MessageCircle, Pill, Baby } from "lucide-react";
import { roleLabels } from "@/lib/constants";
import type { User } from "@/lib/types";

const patientNav = [
  ["/beranda", "Beranda", Home],
  ["/kehamilan", "Kehamilan", HeartPulse],
  ["/edukasi", "Edukasi", HeartPulse],
  ["/konsultasi", "Konsultasi", MessageCircle],
  ["/profil", "Profil", UserRound],
] as const;
const patientMoreNav = [
  ["/jadwal-anc", "Jadwal ANC", CalendarDays],
  ["/kehamilan/jurnal", "Jurnal", ClipboardList],
  ["/rekam-medis", "Rekam medis", FileHeart],
  ["/vaksinasi", "Vaksinasi", Syringe],
  ["/pengingat", "Pengingat", Pill],
  ["/hpk", "1000 HPK", Baby],
  ["/layanan-rs", "Layanan RS", ShieldCheck],
] as const;
const staffNav = [
  ["/dashboard", "Ringkasan", Home],
  ["/dashboard/jadwal", "Jadwal ANC", CalendarDays],
  ["/dashboard/terlewat", "Jadwal terlewat", ClipboardList],
  ["/dashboard/pasien", "Pasien", UserRound],
] as const;

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff = user.role !== "PREGNANT_MOTHER";
  const nav = isStaff ? staffNav : patientNav;
  return <div className="min-h-screen bg-[#f8fafc]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white lg:block">
      <div className="flex h-full flex-col p-5">
        <Link href="/" className="mb-9 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#ff5ca8] to-[#38b6ff] text-lg font-black text-white shadow-sm">♥</span><div><p className="font-black tracking-tight text-slate-800"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Maternal journey assistant</p></div></Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{isStaff ? "Healthcare provider" : "Perjalanan ibu"}</p>
        <nav aria-label={isStaff ? "Navigasi dashboard tenaga kesehatan" : "Navigasi dashboard ibu hamil"} className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-3 pr-1 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">{[...nav, ...(!isStaff ? patientMoreNav : [])].map(([href, label, Icon]) => {
          const isActive = pathname === href || (href !== "/beranda" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-gradient-to-r from-brand to-[#ff6da9] text-white shadow-[0_5px_12px_rgba(255,79,145,0.2)]" : "text-[#53627d] hover:bg-mint hover:text-brand-dark"}`}><Icon className="size-[18px]" />{label}</Link>;
        })}</nav>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#fff0f6] to-[#eaf7ff] p-4"><p className="text-sm font-bold text-slate-800">{user.fullName}</p><p className="mt-1 text-xs text-slate-500">{roleLabels[user.role]}</p><Link href="/profil" className="mt-3 block text-xs font-bold text-brand">Lihat profil →</Link></div>
      </div>
    </aside>
    <div className="lg:pl-72"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white/95 px-5 backdrop-blur lg:px-9"><Link href="/" className="flex items-center gap-2 font-black lg:hidden"><span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#ff5ca8] to-[#38b6ff] text-white">♥</span><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></Link><div className="hidden text-sm text-slate-500 lg:block"><Sparkles className="mr-2 inline size-4 text-brand" />Selamat datang kembali, <span className="font-bold text-slate-800">{user.fullName.split(" ")[0]}</span></div><div className="flex items-center gap-4"><Bell className="size-5 text-slate-500" /><span className="hidden h-8 w-px bg-slate-200 sm:block" /><span className="grid size-9 place-items-center rounded-full border border-pink-200 bg-pink-50 text-xs font-bold text-brand">{user.fullName.slice(0, 2).toLowerCase()}</span><div className="hidden sm:block"><p className="text-xs font-bold">{user.fullName}</p><p className="text-[10px] text-slate-500">{roleLabels[user.role]}</p></div><form action="/api/auth/logout" method="post"><button type="submit" className="rounded-lg p-2 text-slate-500 hover:bg-mint" aria-label="Keluar"><LogOut className="size-5" /></button></form></div></header><main className="mx-auto max-w-7xl p-5 pb-24 lg:p-8">{children}</main>{!isStaff && <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-pink-100 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">{nav.map(([href, label, Icon]) => { const active = pathname === href || (href !== "/beranda" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-bold ${active ? "bg-pink-50 text-brand" : "text-slate-400"}`}><Icon className="size-5" />{label}</Link>; })}</nav>}</div>
  </div>;
}

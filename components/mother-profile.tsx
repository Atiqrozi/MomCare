"use client";

import { useMemo, useState } from "react";
import { Activity, Baby, CalendarDays, ChevronRight, Heart, UserRound } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/types";
import { browserApi } from "@/lib/browser-api";

type Profile = {
  nik?: string; insuranceType?: "BPJS" | "UMUM"; bpjsNumber?: string; birthplace?: string; birthDate?: string;
  education?: string; occupation?: string; address?: string; bloodType?: string; medicalHistory?: string;
  lmpDate?: string; estimatedDueDate?: string; pregnancyStatus?: string;
};
type Detail = { title: string; icon: typeof UserRound; color: string; rows: Array<[string, string | undefined]>; href?: string };
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value)) : "Belum dicatat";

export function MotherProfile({ user, profile, live }: { user: User; profile: Profile | null; live: boolean }) {
  const [insurance, setInsurance] = useState(profile?.insuranceType ?? "UMUM");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Detail | null>(null);
  const gestation = useMemo(() => {
    if (!profile?.lmpDate) return "Belum dicatat";
    const days = Math.max(0, Math.floor((Date.now() - new Date(profile.lmpDate).getTime()) / 86_400_000));
    return `${Math.floor(days / 7)} minggu ${days % 7} hari`;
  }, [profile?.lmpDate]);
  const details: Detail[] = [
    { title: "Data Pribadi Lengkap (NIK, JKN, TTL, Pekerjaan)", icon: UserRound, color: "bg-blue-50 text-blue-600", href: "/kehamilan", rows: [["Nama lengkap", user.fullName], ["NIK", profile?.nik], ["Nomor JKN / BPJS", profile?.bpjsNumber], ["Tempat lahir", profile?.birthplace], ["Tanggal lahir", profile?.birthDate ? formatDate(profile.birthDate) : undefined], ["Pendidikan", profile?.education], ["Pekerjaan", profile?.occupation], ["Alamat", profile?.address], ["Nomor HP", user.phone]] },
    { title: "Riwayat Penyakit & Kesehatan Maternal", icon: Activity, color: "bg-emerald-50 text-emerald-600", href: "/rekam-medis", rows: [["Riwayat penyakit", profile?.medicalHistory], ["Golongan darah", profile?.bloodType], ["Status kehamilan", profile?.pregnancyStatus]] },
    { title: "Riwayat Kehamilan & Rekomendasi Persalinan", icon: Heart, color: "bg-pink-50 text-pink-600", href: "/rekam-medis", rows: [["HPHT", profile?.lmpDate ? formatDate(profile.lmpDate) : undefined], ["HPL", profile?.estimatedDueDate ? formatDate(profile.estimatedDueDate) : undefined], ["Rekomendasi persalinan", "Lihat catatan tenaga kesehatan pada Rekam Medis"]] },
    { title: "Kontak Darurat & RS Rujukan", icon: Baby, color: "bg-amber-50 text-amber-600", href: "/layanan-rs", rows: [["Kontak telepon akun", user.phone], ["Kontak darurat", undefined], ["Rumah sakit rujukan", undefined]] },
  ];

  async function updateInsurance(next: "BPJS" | "UMUM") {
    setError(""); setNotice("");
    if (!live) { setError("Hubungkan backend untuk menyimpan jenis pembiayaan."); return; }
    if (next === "BPJS" && !profile?.bpjsNumber) { setError("Lengkapi nomor BPJS/JKN terlebih dahulu di data kehamilan."); return; }
    try {
      await browserApi("/pregnancy/profile", { method: "PUT", body: JSON.stringify({ insuranceType: next, ...(next === "BPJS" ? { bpjsNumber: profile?.bpjsNumber } : {}) }) });
      setInsurance(next); setNotice("Metode layanan berhasil diperbarui.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pembiayaan gagal diperbarui."); }
  }

  return <>
    {!live && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Mode demo: belum ada data pasien tersimpan. Data profil akan tampil setelah backend aktif dan profil kehamilan dilengkapi.</p>}
    <section className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-rose-50/70 to-sky-50 p-5 shadow-sm">
      <div className="flex items-center gap-4"><div className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-white bg-pink-100 text-3xl font-black text-pink-500 shadow">{user.fullName.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-500">Gol. Darah {profile?.bloodType ?? "—"}</span><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${insurance === "BPJS" ? "border border-emerald-200 bg-emerald-100 text-emerald-700" : "border border-blue-200 bg-blue-100 text-blue-700"}`}>{insurance === "BPJS" ? "BPJS / JKN" : "Pasien Umum"}</span></div><h2 className="mt-1 truncate text-2xl font-black text-slate-900">{user.fullName}</h2><p className="text-sm text-slate-600">NIK: {profile?.nik ?? "Belum dicatat"}</p><p className="mt-2 text-sm text-slate-500">HPHT: <b className="text-pink-600">{profile?.lmpDate ? formatDate(profile.lmpDate) : "Belum dicatat"}</b></p></div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-pink-200/60 py-4"><span className="text-sm font-bold text-slate-600">Metode layanan RS:</span><div className="flex rounded-xl border border-pink-100 bg-white/90 p-1"><button onClick={() => void updateInsurance("BPJS")} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${insurance === "BPJS" ? "bg-emerald-600 text-white" : "text-slate-500"}`}>BPJS / JKN</button><button onClick={() => void updateInsurance("UMUM")} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${insurance === "UMUM" ? "bg-blue-600 text-white" : "text-slate-500"}`}>Umum</button></div></div>
      <div className="grid grid-cols-2 gap-3 pt-4"><div className="flex items-center gap-3 rounded-2xl bg-white/85 p-4"><span className="grid size-10 place-items-center rounded-xl bg-pink-100 text-pink-600"><CalendarDays className="size-5" /></span><div><p className="text-xs text-slate-500">Usia kehamilan</p><p className="font-extrabold text-slate-800">{gestation}</p></div></div><div className="flex items-center gap-3 rounded-2xl bg-white/85 p-4"><span className="grid size-10 place-items-center rounded-xl bg-sky-100 text-sky-600"><Baby className="size-5" /></span><div><p className="text-xs text-slate-500">HPL</p><p className="font-extrabold text-slate-800">{profile?.estimatedDueDate ? formatDate(profile.estimatedDueDate) : "Belum dicatat"}</p></div></div></div>
      {(notice || error) && <p role={error ? "alert" : "status"} className={`mt-3 text-sm ${error ? "text-red-700" : "text-emerald-700"}`}>{error || notice}</p>}
    </section>
    <section className="mt-7"><h2 className="mb-3 px-1 text-lg font-extrabold text-slate-800">Informasi Identitas & Rekam Medis Dasar</h2><div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">{details.map((item) => { const Icon = item.icon; return <button key={item.title} onClick={() => setSelected(item)} className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 text-left last:border-0 hover:bg-pink-50/40"><span className="flex items-center gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.color}`}><Icon className="size-5" /></span><span className="text-sm font-bold text-slate-700">{item.title}</span></span><ChevronRight className="size-5 shrink-0 text-slate-400" /></button>; })}</div><Link href="/kehamilan" className="mt-4 inline-block text-sm font-bold text-blue-600">Lengkapi atau perbarui data kehamilan →</Link></section>
    {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="font-black text-slate-900">{selected.title}</h2><button onClick={() => setSelected(null)} className="rounded-lg px-3 py-1 text-sm font-bold text-slate-500">Tutup</button></div><div className="divide-y divide-slate-100">{selected.rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="break-words text-right font-semibold text-slate-800">{value || "Belum dicatat"}</span></div>)}</div>{selected.href && <Link href={selected.href} className="mt-4 block rounded-xl bg-pink-50 p-3 text-center text-sm font-bold text-pink-700">Buka detail →</Link>}</section></div>}
  </>;
}

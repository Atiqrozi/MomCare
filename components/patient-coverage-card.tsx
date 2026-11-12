"use client";

import { useState } from "react";
import { ArrowUpRight, BadgeCheck, X } from "lucide-react";

export function PatientCoverageCard() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="h-full w-full rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300">
      <span className="grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-600"><BadgeCheck className="size-7" /></span>
      <span className="mt-4 block text-base font-black text-slate-800">Pasien Umum & BPJS/JKN</span>
      <span className="mt-2 block text-sm leading-6 text-slate-500">Informasi jalur layanan pasien rumah sakit.</span>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-pink-600">Lihat informasi <ArrowUpRight className="size-4" /></span>
    </button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="patient-coverage-title" className="w-full max-w-xl rounded-[2rem] border border-pink-100 bg-white p-6 shadow-2xl shadow-pink-200/40 sm:p-8">
        <header className="flex items-start justify-between gap-4">
          <h2 id="patient-coverage-title" className="text-xl font-black leading-7 text-slate-900">Informasi Layanan Pasien Umum &amp; BPJS Kesehatan / JKN</h2>
          <button type="button" aria-label="Tutup informasi layanan" onClick={() => setOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-pink-50 hover:text-pink-600"><X className="size-5" /></button>
        </header>
        <div className="mt-5 space-y-3">
          <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-slate-800">Jalur Pasien BPJS / JKN</h3><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">BPJS Aktif</span></div>
            <p className="mt-2 text-sm leading-6 text-slate-500">Pemeriksaan ANC, USG medis, Persalinan Normal &amp; SC atas indikasi medis dijamin penuh oleh JKN.</p>
          </article>
          <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-slate-800">Jalur Pasien Umum / Mandiri</h3><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">Layanan Eksekutif</span></div>
            <p className="mt-2 text-sm leading-6 text-slate-500">Pendaftaran cepat tanpa rujukan berjenjang ke seluruh 11 Klinik Spesialis &amp; Layanan Homecare.</p>
          </article>
        </div>
      </section>
    </div>}
  </>;
}

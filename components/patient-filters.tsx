"use client";

import { useRef } from "react";
import type { ChangeEvent } from "react";
import { Search } from "lucide-react";

export function PatientFilters({ q, trimester, risk }: { q: string; trimester: string; risk: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFilters(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      formRef.current?.requestSubmit();
      return;
    }
    if (target instanceof HTMLInputElement && target.name === "q") {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => formRef.current?.requestSubmit(), 400);
    }
  }

  return <form ref={formRef} action="/dashboard/pasien" method="get" onChange={updateFilters} className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-12">
    <label className="relative md:col-span-6"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input name="q" defaultValue={q} className="field pl-10" placeholder="Cari nama, NIK, atau Nomor JKN..." /></label>
    <select name="trimester" defaultValue={trimester} aria-label="Filter trimester" className="field md:col-span-3"><option value="all">Semua Trimester</option><option value="1">Trimester 1</option><option value="2">Trimester 2</option><option value="3">Trimester 3</option></select>
    <select name="risk" defaultValue={risk} aria-label="Filter tingkat risiko" className="field md:col-span-3"><option value="all">Semua Tingkat Risiko</option><option value="low">Risiko Rendah</option><option value="medium">Risiko Sedang</option><option value="high">Risiko Tinggi</option><option value="none">Belum dinilai</option></select>
  </form>;
}

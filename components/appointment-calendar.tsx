"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentStatusActions } from "./appointment-status-actions";
import { Card, StatusBadge } from "./ui";
import { browserApi } from "@/lib/browser-api";

export type CalendarAppointment = { id: string; patientId: string; scheduledAt: string; patient: string; provider: string; facility: string; facilityAddress: string; type: string; status: string; insuranceType?: string };
type AppointmentResponse = { _id: string; scheduledAt: string; status: string; visitType?: string; patientId: string; patientName?: string; providerName?: string; facilityName?: string; facilityAddress?: string; insuranceType?: string };
const dayKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Jakarta" }).format(date);
const formatDay = (date: string) => new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(date));

export function AppointmentCalendar({ appointments, status }: { appointments: CalendarAppointment[]; status?: string }) {
  const today = dayKey(new Date());
  const [month, setMonth] = useState(() => { const date = new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateAppointments, setDateAppointments] = useState<CalendarAppointment[] | null>(null);
  const [loadingDate, setLoadingDate] = useState(false);
  const [dateError, setDateError] = useState("");
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const appointment of appointments) {
      const key = dayKey(new Date(appointment.scheduledAt));
      map.set(key, [...(map.get(key) ?? []), appointment]);
    }
    return map;
  }, [appointments]);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];
  useEffect(() => {
    let active = true;
    const start = new Date(`${selectedDate}T00:00:00+07:00`);
    const end = new Date(`${selectedDate}T23:59:59.999+07:00`);
    const params = new URLSearchParams({ from: start.toISOString(), to: end.toISOString(), limit: "100" });
    if (status && status !== "all") params.set("status", status);

    setLoadingDate(true);
    setDateError("");
    setDateAppointments(null);
    browserApi<AppointmentResponse[]>(`/dashboard/appointments?${params.toString()}`)
      .then((result) => {
        if (!active) return;
        setDateAppointments(result.map((item) => ({
          id: item._id,
          patientId: item.patientId,
          scheduledAt: item.scheduledAt,
          patient: item.patientName ?? "Pasien",
          provider: item.providerName ?? "Dokter belum ditentukan",
          facility: item.facilityName ?? "Fasilitas tidak tersedia",
          facilityAddress: item.facilityAddress ?? "",
          type: item.visitType ?? "Kunjungan ANC",
          status: item.status,
          insuranceType: item.insuranceType,
        })));
      })
      .catch((error: unknown) => {
        if (!active) return;
        setDateError(error instanceof Error ? error.message : "Jadwal tanggal ini gagal dimuat.");
      })
      .finally(() => { if (active) setLoadingDate(false); });

    return () => { active = false; };
  }, [selectedDate, status]);
  const selectedAppointments = [...(dateAppointments ?? appointmentsByDay.get(selectedDate) ?? [])].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const formatMonth = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(month);
  function moveMonth(delta: number) { setMonth((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1)); }
  function selectDay(day: number) { setSelectedDate(dayKey(new Date(month.getFullYear(), month.getMonth(), day, 12))); }
  return <div className="grid gap-5 lg:grid-cols-12"><Card className="h-fit space-y-4 lg:col-span-5"><div className="flex items-center justify-between"><button aria-label="Bulan sebelumnya" onClick={() => moveMonth(-1)} className="rounded-lg p-2 hover:bg-slate-100"><ChevronLeft className="size-4" /></button><h2 className="font-black capitalize text-slate-800">{formatMonth}</h2><button aria-label="Bulan berikutnya" onClick={() => moveMonth(1)} className="rounded-lg p-2 hover:bg-slate-100"><ChevronRight className="size-4" /></button></div><div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">{["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => <span key={day} className="py-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-1.5 text-center text-sm">{days.map((day, index) => { if (day === null) return <span key={`blank-${index}`} />; const dateKey = dayKey(new Date(month.getFullYear(), month.getMonth(), day, 12)); const hasAppointments = appointmentsByDay.has(dateKey) || (dateKey === selectedDate && (dateAppointments?.length ?? 0) > 0); const active = selectedDate === dateKey; return <button key={day} onClick={() => selectDay(day)} className={`relative mx-auto grid size-9 place-items-center rounded-full font-bold transition ${active ? "bg-blue-600 text-white shadow" : dateKey === today ? "bg-pink-100 text-pink-700" : "text-slate-700 hover:bg-slate-100"}`}>{day}{hasAppointments && <span className={`absolute bottom-0.5 size-1 rounded-full ${active ? "bg-white" : "bg-blue-500"}`} />}</button>; })}</div><div className="border-t border-slate-100 pt-3 text-xs text-slate-500">{selectedAppointments.length} jadwal pada tanggal terpilih</div></Card>
    <Card className="lg:col-span-7"><div className="mb-4"><h2 className="font-black">Daftar pasien pada tanggal terpilih</h2><p className="mt-1 text-xs capitalize text-slate-500">{formatDay(selectedDate)}</p></div>{dateError ? <div role="alert" className="grid min-h-56 place-items-center rounded-xl bg-red-50 px-5 text-center"><p className="text-sm text-red-700">Jadwal gagal dimuat: {dateError}</p></div> : loadingDate ? <div aria-live="polite" className="grid min-h-56 place-items-center rounded-xl bg-slate-50 text-center"><p className="text-sm text-slate-500">Memuat jadwal pada tanggal ini…</p></div> : selectedAppointments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Waktu</th><th className="px-3 py-3">Nama pasien</th><th className="px-3 py-3">Dokter</th><th className="px-3 py-3">Tempat</th><th className="px-3 py-3">Kunjungan</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedAppointments.map((appointment) => <tr key={appointment.id} className="align-top"><td className="whitespace-nowrap px-3 py-3 font-semibold">{new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(appointment.scheduledAt))} WIB</td><td className="px-3 py-3"><Link href={`/dashboard/pasien/${appointment.patientId}`} className="font-bold text-slate-800 hover:text-blue-700">{appointment.patient}</Link>{appointment.insuranceType && <p className="mt-1 text-[10px] text-slate-400">{appointment.insuranceType === "BPJS" ? "BPJS / JKN" : "Pasien umum"}</p>}</td><td className="px-3 py-3">{appointment.provider}</td><td className="px-3 py-3"><p className="font-semibold">{appointment.facility}</p>{appointment.facilityAddress && <p className="mt-1 max-w-44 text-[10px] text-slate-500">{appointment.facilityAddress}</p>}</td><td className="px-3 py-3">{appointment.type}</td><td className="px-3 py-3"><StatusBadge status={appointment.status} /></td><td className="px-3 py-3"><div className="space-y-2"><Link href={`/dashboard/anc/baru?patientId=${encodeURIComponent(appointment.patientId)}`} className="block whitespace-nowrap font-bold text-pink-700">Input ANC</Link><AppointmentStatusActions id={appointment.id} status={appointment.status} /></div></td></tr>)}</tbody></table></div> : <div className="grid min-h-56 place-items-center rounded-xl bg-slate-50 text-center"><p className="text-sm text-slate-500">Tidak ada jadwal pada tanggal ini.</p></div>}</Card></div>;
}

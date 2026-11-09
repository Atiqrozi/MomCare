"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { AppointmentStatusActions } from "./appointment-status-actions";
import { Card, StatusBadge } from "./ui";

export type CalendarAppointment = { id: string; patientId: string; scheduledAt: string; patient: string; type: string; status: string; insuranceType?: string };
const dayKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Jakarta" }).format(date);
const formatDay = (date: string) => new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(date));

export function AppointmentCalendar({ appointments }: { appointments: CalendarAppointment[] }) {
  const today = dayKey(new Date());
  const [month, setMonth] = useState(() => { const date = new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState(today);
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
  const selectedAppointments = [...(appointmentsByDay.get(selectedDate) ?? [])].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const formatMonth = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(month);
  function moveMonth(delta: number) { setMonth((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1)); }
  function selectDay(day: number) { setSelectedDate(dayKey(new Date(month.getFullYear(), month.getMonth(), day, 12))); }
  return <div className="grid gap-5 lg:grid-cols-12"><Card className="h-fit space-y-4 lg:col-span-5"><div className="flex items-center justify-between"><button aria-label="Bulan sebelumnya" onClick={() => moveMonth(-1)} className="rounded-lg p-2 hover:bg-slate-100"><ChevronLeft className="size-4" /></button><h2 className="font-black capitalize text-slate-800">{formatMonth}</h2><button aria-label="Bulan berikutnya" onClick={() => moveMonth(1)} className="rounded-lg p-2 hover:bg-slate-100"><ChevronRight className="size-4" /></button></div><div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">{["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => <span key={day} className="py-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-1.5 text-center text-sm">{days.map((day, index) => { if (day === null) return <span key={`blank-${index}`} />; const dateKey = dayKey(new Date(month.getFullYear(), month.getMonth(), day, 12)); const hasAppointments = appointmentsByDay.has(dateKey); const active = selectedDate === dateKey; return <button key={day} onClick={() => selectDay(day)} className={`relative mx-auto grid size-9 place-items-center rounded-full font-bold transition ${active ? "bg-blue-600 text-white shadow" : dateKey === today ? "bg-pink-100 text-pink-700" : "text-slate-700 hover:bg-slate-100"}`}>{day}{hasAppointments && <span className={`absolute bottom-0.5 size-1 rounded-full ${active ? "bg-white" : "bg-blue-500"}`} />}</button>; })}</div><div className="border-t border-slate-100 pt-3 text-xs text-slate-500">{appointments.length} jadwal tercatat dalam daftar</div></Card>
    <Card className="lg:col-span-7"><div className="mb-4"><h2 className="font-black">Daftar pasien pada tanggal terpilih</h2><p className="mt-1 text-xs capitalize text-slate-500">{formatDay(selectedDate)}</p></div>{selectedAppointments.length ? <div className="space-y-3">{selectedAppointments.map((appointment) => <article key={appointment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-pink-100 font-bold text-pink-600">{appointment.patient.slice(0, 1)}</span><div className="min-w-0"><Link href={`/dashboard/pasien/${appointment.patientId}`} className="font-bold text-slate-800 hover:text-blue-700">{appointment.patient}</Link><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="size-3" />{new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(appointment.scheduledAt))} · {appointment.type}</p>{appointment.insuranceType && <p className="mt-1 text-[10px] text-slate-400">{appointment.insuranceType === "BPJS" ? "BPJS / JKN" : "Pasien umum"}</p>}</div></div><div className="flex items-center gap-2"><StatusBadge status={appointment.status} /><Link href={`/dashboard/anc/baru?patientId=${encodeURIComponent(appointment.patientId)}`} className="rounded-lg bg-pink-50 px-3 py-2 text-xs font-bold text-pink-700">Input ANC</Link></div><div className="w-full border-t border-slate-200 pt-2"><AppointmentStatusActions id={appointment.id} status={appointment.status} /></div></article>)}</div> : <div className="grid min-h-56 place-items-center rounded-xl bg-slate-50 text-center"><p className="text-sm text-slate-500">Tidak ada jadwal pada tanggal ini.</p></div>}</Card></div>;
}

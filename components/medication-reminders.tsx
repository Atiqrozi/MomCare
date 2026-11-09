"use client";

import { useState } from "react";
import { BellRing, Clock3, Pill, Plus, Trash2 } from "lucide-react";
import { browserApi } from "@/lib/browser-api";

type Reminder = { _id: string; name: string; dosage: string; time: string; notes?: string; active: boolean };

export function MedicationReminders({ initial }: { initial: Reminder[] }) {
  const [items, setItems] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function create(form: FormData) {
    setSaving(true); setError(""); setMessage("");
    try {
      const item = await browserApi<Reminder>("/pregnancy/medication-reminders", { method: "POST", body: JSON.stringify({ name: form.get("name"), dosage: form.get("dosage"), time: form.get("time"), notes: form.get("notes") || undefined }) });
      setItems((current) => [...current, item].sort((a, b) => a.time.localeCompare(b.time)));
      setShowForm(false); setMessage("Pengingat berhasil disimpan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengingat gagal disimpan."); }
    finally { setSaving(false); }
  }
  async function toggle(item: Reminder) {
    setError(""); setMessage("");
    try {
      const updated = await browserApi<Reminder>(`/pregnancy/medication-reminders/${item._id}`, { method: "PATCH", body: JSON.stringify({ active: !item.active }) });
      setItems((current) => current.map((entry) => entry._id === item._id ? updated : entry));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Status pengingat gagal diubah."); }
  }
  async function remove(item: Reminder) {
    setError(""); setMessage("");
    try { await browserApi(`/pregnancy/medication-reminders/${item._id}`, { method: "DELETE" }); setItems((current) => current.filter((entry) => entry._id !== item._id)); setMessage("Pengingat dihapus."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Pengingat gagal dihapus."); }
  }

  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">Obat & vitamin</h2><p className="mt-1 text-sm text-slate-500">Atur nama, dosis, dan waktu pengingat harian.</p></div><button onClick={() => setShowForm((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white"><Plus className="size-4" />Tambah</button></div>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {showForm && <form action={create} className="grid gap-3 rounded-2xl border border-pink-100 bg-white p-4 sm:grid-cols-2"><label className="text-sm font-bold">Nama obat / vitamin<input name="name" required maxLength={120} className="field mt-2" placeholder="Contoh: Tablet tambah darah" /></label><label className="text-sm font-bold">Dosis / petunjuk<input name="dosage" required maxLength={160} className="field mt-2" placeholder="Contoh: 1 tablet setelah makan" /></label><label className="text-sm font-bold">Waktu<input name="time" type="time" required defaultValue="09:00" className="field mt-2" /></label><label className="text-sm font-bold">Catatan (opsional)<input name="notes" maxLength={240} className="field mt-2" placeholder="Catatan pribadi" /></label><button disabled={saving} className="rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{saving ? "Menyimpan…" : "Simpan pengingat"}</button></form>}
    {items.length ? <div className="space-y-3">{items.map((item) => <article key={item._id} className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm ${item.active ? "border-slate-100" : "border-slate-100 opacity-60"}`}><span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600"><Pill className="size-5" /></span><div className="min-w-40 flex-1"><h3 className="font-extrabold text-slate-800">{item.name}</h3><p className="mt-1 text-sm text-slate-500">{item.dosage}</p>{item.notes && <p className="mt-1 text-xs text-slate-400">{item.notes}</p>}</div><span className="flex items-center gap-1 text-sm font-bold text-pink-600"><Clock3 className="size-4" />{item.time}</span><label className="flex items-center gap-2 text-xs font-semibold text-slate-500"><input type="checkbox" checked={item.active} onChange={() => void toggle(item)} />Aktif</label><button onClick={() => void remove(item)} aria-label={`Hapus ${item.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button></article>)}</div> : <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center"><BellRing className="mx-auto size-7 text-pink-400" /><p className="mt-3 font-bold text-slate-700">Belum ada pengingat obat</p><p className="mt-1 text-sm text-slate-500">Tambahkan obat atau vitamin yang ingin Anda ingat.</p></div>}
    <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Pengingat tersimpan di akun Anda. Notifikasi otomatis pada waktu terpilih memerlukan layanan push yang dikonfigurasi di perangkat.</p>
  </section>;
}

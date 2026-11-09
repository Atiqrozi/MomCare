"use client";

import { useState } from "react";
import { Activity, Baby, ChevronRight, Heart, Shield, X } from "lucide-react";
import { Card } from "@/components/ui";
import { browserApi } from "@/lib/browser-api";

type Child = { _id: string; fullName: string; birthDate: string; sex: "male" | "female" | "unspecified"; notes?: string };
type Growth = { _id: string; measuredAt: string; weightKg: number; heightCm: number; headCircumferenceCm?: number; notes?: string };
type Immunization = { _id: string; vaccineName: string; scheduledDate?: string; administeredDate?: string; status: string; notes?: string };

const stages = {
  "0-6 bulan": { summary: "Fase ASI eksklusif", cards: [
    { title: "Imunisasi", subtitle: "Lihat panduan imunisasi bayi", badge: "Jadwal mengikuti Buku KIA", detail: "Bawa Buku KIA saat kunjungan. Tenaga kesehatan akan membantu memeriksa imunisasi yang sudah diterima dan menentukan jadwal berikutnya berdasarkan usia serta catatan anak." },
    { title: "Pemantauan tumbuh kembang", subtitle: "Berat badan, panjang badan, lingkar kepala", badge: "Catat setiap kunjungan Posyandu", detail: "Pantau berat badan, panjang badan, dan lingkar kepala secara berkala. Baca hasil bersama tenaga kesehatan menggunakan kurva pertumbuhan pada Buku KIA." },
    { title: "Panduan ASI", subtitle: "Informasi pemberian makan bayi", badge: "ASI eksklusif sampai usia 6 bulan", detail: "ASI eksklusif dianjurkan selama enam bulan pertama. Jika mengalami kesulitan menyusui atau bayi sulit minum, konsultasikan dengan tenaga kesehatan." },
    { title: "Perkembangan motorik & kognitif", subtitle: "Stimulasi sesuai tahap usia", badge: "Interaksi, bermain, dan tummy time", detail: "Ajak bayi berbicara, tatap dan respons suara atau gerakannya. Lakukan tummy time ketika bayi terjaga dan diawasi. Sesuaikan stimulasi dengan kemampuan anak." },
  ] },
  "6-12 bulan": { summary: "Mulai MPASI saat usia 6 bulan", cards: [
    { title: "Imunisasi", subtitle: "Periksa jadwal dasar dan lanjutan", badge: "Cek catatan di Buku KIA", detail: "Jadwal imunisasi anak bergantung pada usia dan dosis sebelumnya. Bawa Buku KIA ke Posyandu atau fasilitas kesehatan untuk memastikan jadwal yang sesuai." },
    { title: "Pemantauan tumbuh kembang", subtitle: "Pantau kurva pertumbuhan secara rutin", badge: "Pengukuran berkala di Posyandu", detail: "Catat berat badan dan panjang badan anak secara berkala. Tenaga kesehatan dapat membantu membaca kurva pertumbuhan dan menilai apakah perlu pemeriksaan lanjutan." },
    { title: "Panduan MPASI", subtitle: "Tekstur dan variasi makanan sesuai usia", badge: "MPASI mulai usia 6 bulan", detail: "Mulai MPASI ketika anak berusia enam bulan dengan tekstur dan frekuensi yang sesuai tahap perkembangannya. Utamakan makanan beragam dan sumber protein. Konsultasikan kebutuhan khusus anak dengan tenaga kesehatan." },
    { title: "Perkembangan motorik & kognitif", subtitle: "Bermain dan stimulasi sehari-hari", badge: "Berikan ruang eksplorasi yang aman", detail: "Ajak anak bermain, meraih benda aman, merespons suara, dan berinteraksi. Hindari benda kecil atau benda yang berisiko tertelan." },
  ] },
  "1-2 tahun": { summary: "Lanjutkan pemantauan hingga usia 2 tahun", cards: [
    { title: "Imunisasi", subtitle: "Tinjau imunisasi lanjutan", badge: "Konfirmasi jadwal di fasilitas kesehatan", detail: "Tunjukkan Buku KIA untuk meninjau imunisasi dasar dan lanjutan yang sudah diberikan. Tenaga kesehatan akan menentukan jadwal berikutnya sesuai riwayat anak." },
    { title: "Pemantauan tumbuh kembang", subtitle: "Pantau berat, tinggi, dan lingkar kepala", badge: "Pemeriksaan rutin tetap penting", detail: "Lanjutkan pengukuran rutin dan diskusikan perubahan kurva, kesulitan makan, atau kekhawatiran perkembangan dengan tenaga kesehatan." },
    { title: "Nutrisi keluarga", subtitle: "Makanan beragam dan aman", badge: "Lanjutkan ASI hingga usia 2 tahun", detail: "Berikan makanan keluarga yang aman, beragam, dan sesuai kemampuan mengunyah anak. Ciptakan suasana makan responsif dan lanjutkan ASI hingga usia dua tahun atau lebih." },
    { title: "Perkembangan & stimulasi", subtitle: "Bahasa, gerak, dan interaksi", badge: "Ajak bicara, membaca, dan bermain", detail: "Sediakan waktu untuk bermain dan berbicara bersama anak. Jika ada kemampuan yang hilang atau kekhawatiran perkembangan, sampaikan kepada tenaga kesehatan." },
  ] },
} as const;
type Stage = keyof typeof stages;
type Guide = (typeof stages)[Stage]["cards"][number];

export function HpkJourney({ initialChild, initialGrowth, initialImmunizations, live }: { initialChild: Child | null; initialGrowth: Growth[]; initialImmunizations: Immunization[]; live: boolean }) {
  const [child, setChild] = useState(initialChild);
  const [growth, setGrowth] = useState(initialGrowth);
  const [immunizations, setImmunizations] = useState(initialImmunizations);
  const [stage, setStage] = useState<Stage>(() => {
    if (!initialChild) return "0-6 bulan";
    const months = (Date.now() - new Date(initialChild.birthDate).getTime()) / (30.4375 * 86_400_000);
    return months < 6 ? "0-6 bulan" : months < 12 ? "6-12 bulan" : "1-2 tahun";
  });
  const [selected, setSelected] = useState<Guide | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showChildForm, setShowChildForm] = useState(!initialChild);
  const [showGrowthForm, setShowGrowthForm] = useState(false);
  const [showImmunizationForm, setShowImmunizationForm] = useState(false);
  const current = stages[stage];
  const icons = [Shield, Activity, Heart, Baby];
  const colors = ["bg-blue-50 text-blue-600", "bg-amber-50 text-amber-600", "bg-emerald-50 text-emerald-600", "bg-pink-50 text-pink-600"];
  async function saveChild(form: FormData) {
    setError(""); setNotice("");
    try {
      const saved = await browserApi<Child>("/pregnancy/children/profile", { method: "PUT", body: JSON.stringify({ fullName: form.get("fullName"), birthDate: form.get("birthDate"), sex: form.get("sex"), notes: form.get("notes") || undefined }) });
      setChild(saved); setShowChildForm(false); setNotice("Profil anak berhasil disimpan.");
      const months = (Date.now() - new Date(saved.birthDate).getTime()) / (30.4375 * 86_400_000);
      setStage(months < 6 ? "0-6 bulan" : months < 12 ? "6-12 bulan" : "1-2 tahun");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Profil anak gagal disimpan."); }
  }
  async function saveGrowth(form: FormData) {
    setError(""); setNotice("");
    try {
      const date = String(form.get("measuredAt"));
      const entry = await browserApi<Growth>("/pregnancy/children/growth", { method: "POST", body: JSON.stringify({ measuredAt: new Date(`${date}T12:00:00.000Z`).toISOString(), weightKg: Number(form.get("weightKg")), heightCm: Number(form.get("heightCm")), headCircumferenceCm: form.get("headCircumferenceCm") ? Number(form.get("headCircumferenceCm")) : undefined, notes: form.get("notes") || undefined }) });
      setGrowth((items) => [entry, ...items].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))); setShowGrowthForm(false); setNotice("Pengukuran pertumbuhan berhasil disimpan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengukuran gagal disimpan."); }
  }
  async function saveImmunization(form: FormData) {
    setError(""); setNotice("");
    try {
      const scheduled = String(form.get("scheduledDate") ?? "");
      const administered = String(form.get("administeredDate") ?? "");
      const entry = await browserApi<Immunization>("/pregnancy/children/immunizations", { method: "POST", body: JSON.stringify({ vaccineName: form.get("vaccineName"), scheduledDate: scheduled ? new Date(`${scheduled}T12:00:00.000Z`).toISOString() : undefined, administeredDate: administered ? new Date(`${administered}T12:00:00.000Z`).toISOString() : undefined, notes: form.get("notes") || undefined }) });
      setImmunizations((items) => [...items, entry].sort((a, b) => (a.scheduledDate ?? a.administeredDate ?? "").localeCompare(b.scheduledDate ?? b.administeredDate ?? "")));
      setShowImmunizationForm(false); setNotice("Catatan imunisasi anak berhasil disimpan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Catatan imunisasi gagal disimpan."); }
  }
  return <>
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="overflow-hidden border-sky-100 bg-gradient-to-r from-sky-50 via-blue-50 to-pink-50">
        <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-pink-500 shadow-sm"><Baby className="size-8" /></span><div><p className="text-sm font-semibold text-slate-500">{child ? `Usia ${child.fullName}` : "Periode terpilih"}</p><h2 className="text-xl font-black text-slate-900">{child ? ageText(child.birthDate) : stage}</h2><p className="mt-1 text-sm font-semibold text-sky-700">{current.summary}</p></div></div><button onClick={() => setShowChildForm((open) => !open)} className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm">{child ? "Ubah profil anak" : "Tambah profil anak"}</button></div>
        <p className="mt-4 rounded-xl border border-white/70 bg-white/70 p-3 text-xs leading-5 text-slate-600">Catatan pengukuran disimpan untuk akun Anda. Panduan umum tidak menggantikan penilaian tenaga kesehatan dan tidak otomatis menentukan status gizi.</p>
      </Card>
      {(notice || error) && <p role={error ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || notice}</p>}
      {showChildForm && <Card><h2 className="font-black">Profil anak</h2><form action={saveChild} className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Nama anak<input name="fullName" required maxLength={120} defaultValue={child?.fullName ?? ""} className="field mt-2" /></label><label className="text-sm font-bold">Tanggal lahir<input name="birthDate" type="date" required defaultValue={child?.birthDate?.slice(0, 10)} className="field mt-2" /></label><label className="text-sm font-bold">Jenis kelamin<select name="sex" defaultValue={child?.sex ?? "unspecified"} className="field mt-2"><option value="unspecified">Belum dipilih</option><option value="female">Perempuan</option><option value="male">Laki-laki</option></select></label><label className="text-sm font-bold">Catatan opsional<input name="notes" maxLength={500} defaultValue={child?.notes ?? ""} className="field mt-2" /></label><button disabled={!live} className="rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">Simpan profil anak</button>{!live && <p className="text-xs text-amber-700 sm:col-span-2">Aktifkan backend untuk menyimpan profil anak.</p>}</form></Card>}
      {child && <Card><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Catatan pertumbuhan</h2><p className="mt-1 text-sm text-slate-500">Berat, panjang/tinggi, dan lingkar kepala yang Anda catat.</p></div><button onClick={() => setShowGrowthForm((open) => !open)} className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white">Catat pengukuran</button></div>
        {showGrowthForm && <form action={saveGrowth} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><label className="text-sm font-bold">Tanggal ukur<input name="measuredAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="field mt-2" /></label><label className="text-sm font-bold">Berat (kg)<input name="weightKg" type="number" min="0.3" max="80" step="0.01" required className="field mt-2" /></label><label className="text-sm font-bold">Panjang / tinggi (cm)<input name="heightCm" type="number" min="20" max="150" step="0.1" required className="field mt-2" /></label><label className="text-sm font-bold">Lingkar kepala (cm)<input name="headCircumferenceCm" type="number" min="15" max="70" step="0.1" className="field mt-2" /></label><label className="text-sm font-bold sm:col-span-2">Catatan<input name="notes" maxLength={500} className="field mt-2" /></label><button disabled={!live} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">Simpan pengukuran</button></form>}
        {growth.length ? <div className="mt-4 divide-y divide-slate-100">{growth.map((entry) => <div key={entry._id} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_2fr]"><span className="font-semibold text-slate-500">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(entry.measuredAt))}</span><span className="font-bold text-slate-800">{entry.weightKg} kg · {entry.heightCm} cm{entry.headCircumferenceCm ? ` · LK ${entry.headCircumferenceCm} cm` : ""}{entry.notes ? <span className="block text-xs font-normal text-slate-500">{entry.notes}</span> : null}</span></div>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada pengukuran pertumbuhan tersimpan.</p>}</Card>}
      {child && <Card><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Imunisasi anak</h2><p className="mt-1 text-sm text-slate-500">Catat jadwal atau imunisasi yang telah diberikan sesuai Buku KIA.</p></div><button onClick={() => setShowImmunizationForm((open) => !open)} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Tambah catatan</button></div>
        {showImmunizationForm && <form action={saveImmunization} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><label className="text-sm font-bold">Nama imunisasi<input name="vaccineName" required maxLength={120} className="field mt-2" placeholder="Nama sesuai Buku KIA" /></label><label className="text-sm font-bold">Tanggal jadwal<input name="scheduledDate" type="date" className="field mt-2" /></label><label className="text-sm font-bold">Tanggal diberikan (opsional)<input name="administeredDate" type="date" className="field mt-2" /></label><label className="text-sm font-bold">Catatan<input name="notes" maxLength={500} className="field mt-2" /></label><button disabled={!live} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">Simpan catatan</button></form>}
        {immunizations.length ? <div className="mt-4 divide-y divide-slate-100">{immunizations.map((item) => <div key={item._id} className="flex flex-wrap items-center gap-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{item.status === "completed" ? "Sudah diberikan" : "Terjadwal"}</span><span className="flex-1 text-sm font-bold text-slate-800">{item.vaccineName}</span><span className="text-xs text-slate-500">{item.administeredDate ? `Diberikan ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(item.administeredDate))}` : item.scheduledDate ? `Jadwal ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(item.scheduledDate))}` : "Tanggal belum dicatat"}</span></div>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada catatan imunisasi anak.</p>}<p className="mt-3 text-xs text-amber-700">Catatan yang dimasukkan ibu belum diverifikasi oleh tenaga kesehatan.</p></Card>}
      <Card className="space-y-4"><div className="grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1">{(Object.keys(stages) as Stage[]).map((item) => <button key={item} onClick={() => setStage(item)} className={`rounded-full py-2 text-xs font-bold transition ${stage === item ? "bg-pink-500 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}>{item}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2">{current.cards.map((item, index) => { const Icon = icons[index]; return <button key={item.title} onClick={() => setSelected(item)} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-pink-200"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${colors[index]}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-slate-900">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span></span><ChevronRight className="size-4 shrink-0 text-slate-400" /></button>; })}</div>
      </Card>
    </div>
    {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="hpk-dialog-title" className="w-full max-w-lg space-y-4 rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-bold text-sky-700">{selected.badge}</span><button onClick={() => setSelected(null)} aria-label="Tutup" className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600"><X className="size-4" /></button></div><h2 id="hpk-dialog-title" className="text-lg font-black text-slate-900">{selected.title}</h2><p className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-sm leading-6 text-slate-600">{selected.detail}</p><button onClick={() => setSelected(null)} className="w-full rounded-full bg-pink-500 py-3 text-sm font-bold text-white">Tutup panduan</button></section></div>}
  </>;
}

function ageText(birthDate: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(birthDate).getTime()) / 86_400_000));
  if (days < 30) return `${days} hari`;
  const months = Math.floor(days / 30.4375);
  return months < 24 ? `${months} bulan` : `${Math.floor(months / 12)} tahun ${months % 12} bulan`;
}

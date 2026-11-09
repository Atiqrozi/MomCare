"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { browserApi } from "@/lib/browser-api";

type Provider = { id: string; fullName: string };
type PatientOption = { patientId: string; fullName: string; nik?: string; bpjsNumber?: string; insuranceType: "BPJS" | "UMUM"; estimatedDueDate?: string; lmpDate?: string; assignedProviders: Provider[] };
type LaborBagEntry = { _id: string; patientId: string; patientName: string; examinationDate: string; insuranceType: "BPJS" | "UMUM"; estimatedDueDate: string; deliveryType: "SC" | "SPONTAN"; gestationalWeeks?: number; gestationalDays?: number; providerId: string; providerName: string };
export type LaborBagData = { entries: LaborBagEntry[]; patients: PatientOption[]; providers: Provider[] };

function normalizeData(value?: Partial<LaborBagData> | null): LaborBagData {
  return {
    entries: Array.isArray(value?.entries) ? value.entries : Array.isArray((value as { data?: unknown[] } | null | undefined)?.data) ? (value as { data: LaborBagEntry[] }).data : [],
    patients: Array.isArray(value?.patients) ? value.patients : [],
    providers: Array.isArray(value?.providers) ? value.providers : [],
  };
}

function dateInput(value?: string) { return value ? new Date(value).toISOString().slice(0, 10) : ""; }
function estimatedHpl(patient?: PatientOption) {
  if (patient?.estimatedDueDate) return dateInput(patient.estimatedDueDate);
  if (!patient?.lmpDate) return "";
  const hpl = new Date(`${patient.lmpDate.slice(0, 10)}T00:00:00.000Z`);
  hpl.setUTCDate(hpl.getUTCDate() + 280);
  return hpl.toISOString().slice(0, 10);
}
function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value)) : "—"; }

export function LaborBagConsole({ initialData }: { initialData: LaborBagData }) {
  const [data, setData] = useState(() => normalizeData(initialData));
  const [patientId, setPatientId] = useState("");
  const [examinationDate, setExaminationDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [insuranceType, setInsuranceType] = useState<"BPJS" | "UMUM">("BPJS");
  const [estimatedDueDate, setEstimatedDueDate] = useState("");
  const [deliveryType, setDeliveryType] = useState<"SC" | "SPONTAN">("SPONTAN");
  const [providerId, setProviderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const patients = Array.isArray(data.patients) ? data.patients : [];
  const entries = Array.isArray(data.entries) ? data.entries : [];
  const patient = patients.find((item) => item.patientId === patientId);
  const currentEntry = entries.find((item) => item.patientId === patientId);
  const providers = patient?.assignedProviders ?? [];
  const sortedEntries = useMemo(() => [...entries].sort((a, b) => a.estimatedDueDate.localeCompare(b.estimatedDueDate)), [entries]);

  function choosePatient(id: string) {
    setPatientId(id);
    const selected = patients.find((item) => item.patientId === id);
    const existing = entries.find((item) => item.patientId === id);
    setInsuranceType(existing?.insuranceType ?? selected?.insuranceType ?? "BPJS");
    setEstimatedDueDate(dateInput(existing?.estimatedDueDate) || estimatedHpl(selected));
    setDeliveryType(existing?.deliveryType ?? "SPONTAN");
    setExaminationDate(dateInput(existing?.examinationDate) || new Date().toLocaleDateString("en-CA"));
    setProviderId(existing?.providerId ?? selected?.assignedProviders[0]?.id ?? "");
    setNotice("");
    setError("");
  }

  async function refresh() {
    const response = await browserApi<LaborBagData>("/dashboard/labor-bag");
    setData(normalizeData(response));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setNotice(""); setError("");
    try {
      await browserApi("/dashboard/labor-bag", { method: "POST", body: JSON.stringify({ patientId, examinationDate, insuranceType, estimatedDueDate, deliveryType, providerId }) });
      await refresh();
      setNotice("Data pasien berhasil disimpan ke Kantong Persalinan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Data gagal disimpan."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus pasien ini dari Kantong Persalinan?")) return;
    setBusy(true); setNotice(""); setError("");
    try {
      await browserApi(`/dashboard/labor-bag/${encodeURIComponent(id)}`, { method: "DELETE" });
      await refresh();
      if (patientId === id) choosePatient("");
      setNotice("Pasien dihapus dari Kantong Persalinan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Data gagal dihapus."); }
    finally { setBusy(false); }
  }

  const gestationalAge = patient?.lmpDate && examinationDate ? (() => {
    const [y, m, d] = patient.lmpDate!.slice(0, 10).split("-").map(Number);
    const [ey, em, ed] = examinationDate.split("-").map(Number);
    const days = Math.floor((Date.UTC(ey, em - 1, ed) - Date.UTC(y, m - 1, d)) / 86_400_000);
    return days >= 0 ? `${Math.floor(days / 7)} minggu ${days % 7} hari` : "—";
  })() : "—";

  return <div className="space-y-5">
    {(notice || error) && <p role={error ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || notice}</p>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Tambah atau ubah pasien</h2>
      <p className="mt-1 text-sm text-slate-500">Pilih ibu hamil dalam cakupan layanan. Data HPL dan penjamin terisi dari profil kehamilan.</p>
      <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold">Nama pasien<select required value={patientId} onChange={(event) => choosePatient(event.target.value)} className="field mt-2"><option value="">Pilih pasien</option>{patients.map((item) => <option key={item.patientId} value={item.patientId}>{item.fullName}</option>)}</select></label>
        <label className="text-sm font-bold">Tanggal periksa<input required type="date" value={examinationDate} onChange={(event) => setExaminationDate(event.target.value)} className="field mt-2" /></label>
        <label className="text-sm font-bold">Penjamin ANC<select required value={insuranceType} onChange={(event) => setInsuranceType(event.target.value as "BPJS" | "UMUM")} className="field mt-2"><option value="BPJS">BPJS</option><option value="UMUM">Umum</option></select></label>
        <label className="text-sm font-bold">Tafsiran kelahiran (HPL)<input required type="date" value={estimatedDueDate} onChange={(event) => setEstimatedDueDate(event.target.value)} className="field mt-2" /></label>
        <label className="text-sm font-bold">Jenis persalinan<select required value={deliveryType} onChange={(event) => setDeliveryType(event.target.value as "SC" | "SPONTAN")} className="field mt-2"><option value="SPONTAN">Spontan</option><option value="SC">SC</option></select></label>
        <label className="text-sm font-bold">Umur kehamilan<input readOnly value={gestationalAge} className="field mt-2 bg-slate-50" /></label>
        <label className="text-sm font-bold">DPJP<select required value={providerId} onChange={(event) => setProviderId(event.target.value)} className="field mt-2"><option value="">Pilih dokter</option>{providers.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label>
        {patient && <div className="flex items-end pb-2 text-sm text-slate-500">RM: <Link href={`/dashboard/pasien/${encodeURIComponent(patient.patientId)}`} className="ml-1 font-bold text-blue-700 hover:underline">Buka rekam medis</Link></div>}
        <div className="flex items-end gap-2 xl:col-span-4"><button disabled={busy || !patients.length} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300">{busy ? "Menyimpan..." : currentEntry ? "Simpan perubahan" : "Tambahkan ke kantong"}</button>{currentEntry && <button type="button" onClick={() => choosePatient("")} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal ubah</button>}</div>
      </form>
      {!patients.length && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Belum ada akun dengan role ibu hamil dalam cakupan Anda.</p>}
    </section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-black">Daftar Kantong Persalinan</h2><p className="mt-1 text-sm text-slate-500">Pasien diurutkan berdasarkan tanggal perkiraan persalinan.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Tanggal periksa</th><th className="p-4">Nama pasien</th><th className="p-4">RM</th><th className="p-4">Penjamin ANC</th><th className="p-4">HPL</th><th className="p-4">Jenis persalinan</th><th className="p-4">Umur kehamilan</th><th className="p-4">DPJP</th><th className="p-4">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{sortedEntries.map((item) => <tr key={item._id} className="hover:bg-slate-50"><td className="p-4">{formatDate(item.examinationDate)}</td><td className="p-4 font-bold text-slate-900">{item.patientName}</td><td className="p-4"><Link href={`/dashboard/pasien/${encodeURIComponent(item.patientId)}`} className="font-bold text-blue-700 hover:underline">Lihat RM</Link></td><td className="p-4">{item.insuranceType === "BPJS" ? "BPJS" : "Umum"}</td><td className="p-4">{formatDate(item.estimatedDueDate)}</td><td className="p-4">{item.deliveryType === "SC" ? "SC" : "Spontan"}</td><td className="p-4">{item.gestationalWeeks == null ? "—" : `${item.gestationalWeeks} minggu ${item.gestationalDays ?? 0} hari`}</td><td className="p-4">{item.providerName}</td><td className="p-4"><div className="flex gap-3"><button type="button" onClick={() => choosePatient(item.patientId)} className="font-bold text-blue-700">Ubah</button><button type="button" disabled={busy} onClick={() => void remove(item.patientId)} className="font-bold text-red-600">Hapus</button></div></td></tr>)}</tbody></table>{!sortedEntries.length && <p className="p-10 text-center text-sm text-slate-500">Belum ada pasien di Kantong Persalinan. Tambahkan pasien melalui form di atas.</p>}</div>
      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">{sortedEntries.length} pasien terdaftar.</p>
    </section>
  </div>;
}

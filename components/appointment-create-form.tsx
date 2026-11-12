"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { browserApi } from "@/lib/browser-api";

type Patient = { userId: string; patient?: { fullName?: string } };
type Facility = { _id: string; name: string };
type Provider = { _id: string; fullName: string; facilityId?: string };

export function AppointmentCreateForm({ patients = [], facilities = [], initialPatientId = "" }: { patients?: Patient[]; facilities?: Facility[]; initialPatientId?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [patientId, setPatientId] = useState(initialPatientId);
  const [facilityId, setFacilityId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  useEffect(() => {
    if (!patientId) { setProviders([]); return; }
    let active = true;
    setLoadingProviders(true);
    browserApi<Provider[]>(`/dashboard/patients/${encodeURIComponent(patientId)}/providers`)
      .then((data) => { if (active) setProviders(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setProviders([]); })
      .finally(() => { if (active) setLoadingProviders(false); });
    return () => { active = false; };
  }, [patientId]);
  async function submit(form: FormData) {
    setPending(true); setError(""); setMessage("");
    try {
      const localDate = String(form.get("scheduledAt"));
      await browserApi("/pregnancy/anc-appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: form.get("patientId"),
          providerId: form.get("providerId"),
          facilityId: form.get("facilityId"),
          scheduledAt: new Date(localDate).toISOString(),
          visitType: form.get("visitType"),
          notes: form.get("notes"),
        }),
      });
      setMessage("Jadwal berhasil dibuat.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Jadwal gagal dibuat.");
    } finally { setPending(false); }
  }
  const availableProviders = providers.filter((item) => !facilityId || !item.facilityId || item.facilityId === facilityId);
  return <form action={submit} className="grid gap-5 md:grid-cols-2">
    <label className="text-sm font-bold">Pasien<select name="patientId" required value={patientId} onChange={(event) => { setPatientId(event.target.value); setProviderId(""); }} className="field mt-2"><option value="">{patients.length ? "Pilih pasien" : "Belum ada pasien dalam cakupan Anda"}</option>{patients.map((item) => <option key={item.userId} value={item.userId}>{item.patient?.fullName ?? item.userId}</option>)}</select></label>
    <label className="text-sm font-bold">Tenaga kesehatan<select name="providerId" required value={providerId} onChange={(event) => setProviderId(event.target.value)} className="field mt-2" disabled={!patientId || loadingProviders}><option value="">{!patientId ? "Pilih pasien terlebih dahulu" : loadingProviders ? "Memuat tenaga kesehatan..." : "Pilih tenaga kesehatan"}</option>{availableProviders.map((item) => <option key={item._id} value={item._id}>{item.fullName}</option>)}</select></label>
    <label className="text-sm font-bold">Fasilitas<select name="facilityId" required value={facilityId} onChange={(event) => { setFacilityId(event.target.value); setProviderId(""); }} className="field mt-2"><option value="">Pilih fasilitas</option>{facilities.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-bold">Waktu kunjungan<input name="scheduledAt" required type="datetime-local" className="field mt-2" /></label>
    <label className="text-sm font-bold">Jenis kunjungan<input name="visitType" maxLength={100} className="field mt-2" placeholder="Pemeriksaan ANC" /></label>
    <div className="text-sm"><p className="font-bold">Pengingat pasien</p><p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 font-medium text-slate-600">Dikirim otomatis di chat aplikasi 1 hari sebelum jadwal.</p></div>
    <label className="text-sm font-bold md:col-span-2">Catatan<textarea name="notes" maxLength={1000} rows={3} className="field mt-2" /></label>
    <div className="md:col-span-2">{message && <p role="status" className="mb-3 text-sm font-bold text-emerald-700">{message}</p>}{error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}<button disabled={pending} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "Menyimpan..." : "Buat jadwal ANC"}</button></div>
  </form>;
}

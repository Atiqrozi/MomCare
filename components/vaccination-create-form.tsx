"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function VaccinationCreateForm({ patientId, facilityId }: { patientId: string; facilityId?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(form: FormData) {
    setPending(true); setError(""); setMessage("");
    try {
      const date = String(form.get("scheduledDate") ?? "");
      await browserApi("/pregnancy/vaccinations", { method: "POST", body: JSON.stringify({ patientId, facilityId, vaccineName: form.get("vaccineName"), ...(date ? { scheduledDate: new Date(`${date}T12:00:00.000Z`).toISOString(), status: "scheduled" } : { status: "planned" }), notes: form.get("notes") || undefined }) });
      setMessage("Catatan vaksinasi berhasil dibuat."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Catatan vaksinasi gagal dibuat."); }
    finally { setPending(false); }
  }
  if (!facilityId) return <p className="text-sm text-amber-700">Tetapkan fasilitas pada profil kehamilan pasien sebelum mencatat vaksinasi.</p>;
  return <form action={submit} className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Nama vaksin<input name="vaccineName" required maxLength={120} className="field mt-2" /></label><label className="text-sm font-bold">Tanggal rencana<input name="scheduledDate" type="date" className="field mt-2" /></label><label className="text-sm font-bold sm:col-span-2">Catatan<textarea name="notes" maxLength={1000} rows={2} className="field mt-2" /></label>{error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{message}</p>}<button disabled={pending} className="w-fit rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">{pending ? "Menyimpan..." : "Tambah catatan"}</button></form>;
}

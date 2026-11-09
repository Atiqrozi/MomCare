"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserApi } from "@/lib/browser-api";

export function AppointmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [showReschedule, setShowReschedule] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function cancel() {
    if (!window.confirm("Batalkan jadwal ANC ini?")) return;
    setPending(true); setError("");
    try { await browserApi(`/pregnancy/anc-appointments/${encodeURIComponent(id)}/cancel`, { method: "POST" }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Jadwal gagal dibatalkan."); }
    finally { setPending(false); }
  }
  async function reschedule(form: FormData) {
    const date = String(form.get("scheduledAt"));
    setPending(true); setError("");
    try {
      await browserApi(`/pregnancy/anc-appointments/${encodeURIComponent(id)}/reschedule`, {
        method: "POST", body: JSON.stringify({ scheduledAt: new Date(date).toISOString() }),
      });
      setShowReschedule(false); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengajuan jadwal ulang gagal."); }
    finally { setPending(false); }
  }
  if (!["scheduled", "confirmed", "rescheduled"].includes(status)) return null;
  return <div className="mt-4 border-t border-line pt-4">
    <div className="flex flex-wrap gap-2"><button disabled={pending} onClick={() => setShowReschedule((value) => !value)} className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-brand">Ajukan jadwal ulang</button><button disabled={pending} onClick={cancel} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Batalkan</button></div>
    {showReschedule && <form action={reschedule} className="mt-3 flex flex-col gap-2 sm:flex-row"><input name="scheduledAt" type="datetime-local" required className="field sm:max-w-xs" /><button disabled={pending} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white">Kirim permintaan</button></form>}
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
  </div>;
}

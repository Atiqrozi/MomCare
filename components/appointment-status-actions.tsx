"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

const options = ["scheduled", "confirmed", "completed", "missed", "cancelled"];

export function AppointmentStatusActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function update() {
    setPending(true); setError("");
    try { await browserApi(`/pregnancy/anc-appointments/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Status jadwal gagal diperbarui."); }
    finally { setPending(false); }
  }
  return <div className="flex flex-wrap items-center justify-end gap-2"><select aria-label="Status kunjungan" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="field max-w-44 py-2 text-xs">{options.map((value) => <option key={value} value={value}>{value}</option>)}</select><button onClick={update} disabled={pending || nextStatus === status} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-teal-700 disabled:opacity-40">{pending ? "Menyimpan..." : "Simpan status"}</button>{error && <p role="alert" className="w-full text-right text-xs text-red-600">{error}</p>}</div>;
}

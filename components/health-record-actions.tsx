"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function HealthRecordActions({ id, kind, title, summary = "" }: { id: string; kind: "medical-records" | "vaccinations"; title: string; summary?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function update() {
    setError("");
    if (kind === "medical-records") {
      const recordType = window.prompt("Jenis pemeriksaan", title);
      if (recordType === null) return;
      const nextSummary = window.prompt("Ringkasan pemeriksaan", summary);
      if (nextSummary === null) return;
      await run(() => browserApi(`/pregnancy/${kind}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ recordType, summary: nextSummary }) }));
      return;
    }
    const administeredDate = window.prompt("Tanggal vaksin diberikan (YYYY-MM-DD). Kosongkan untuk tetap sebagai rencana.", "");
    if (administeredDate === null) return;
    const body = administeredDate.trim()
      ? { administeredDate: new Date(`${administeredDate}T12:00:00.000Z`).toISOString(), status: "completed" }
      : { status: "planned" };
    await run(() => browserApi(`/pregnancy/${kind}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(body) }));
  }
  async function remove() {
    if (!window.confirm("Hapus catatan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    await run(() => browserApi(`/pregnancy/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" }));
  }
  async function run(action: () => Promise<unknown>) {
    setPending(true);
    try { await action(); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan catatan gagal."); }
    finally { setPending(false); }
  }
  return <div className="mt-2 flex flex-wrap gap-3"><button disabled={pending} onClick={update} className="text-xs font-bold text-teal-700">Ubah</button><button disabled={pending} onClick={remove} className="text-xs font-bold text-red-700">Hapus</button>{error && <p role="alert" className="w-full text-xs text-red-600">{error}</p>}</div>;
}

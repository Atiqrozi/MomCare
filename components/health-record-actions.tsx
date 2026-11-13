"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function HealthRecordActions({ id, kind }: { id: string; kind: "medical-records" | "vaccinations" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function update() {
    setError("");
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
  return <div className="mt-3 flex flex-wrap items-center gap-3">
    {kind === "medical-records" ? <>
      <Link href={`/dashboard/rekam-medis/${encodeURIComponent(id)}`} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">Lihat detail</Link>
      <Link href={`/dashboard/anc/${encodeURIComponent(id)}/edit`} className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100">Ubah</Link>
    </> : <button disabled={pending} onClick={update} className="text-xs font-bold text-teal-700">Ubah</button>}
    <button disabled={pending} onClick={remove} className="text-xs font-bold text-red-700">Hapus</button>
    {error && <p role="alert" className="w-full text-xs text-red-600">{error}</p>}
  </div>;
}

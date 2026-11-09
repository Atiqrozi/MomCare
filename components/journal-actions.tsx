"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function JournalActions({ id, mood = "", notes = "", symptoms = [] }: { id: string; mood?: string; notes?: string; symptoms?: string[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function edit() {
    const nextMood = window.prompt("Suasana hati", mood);
    if (nextMood === null) return;
    const nextNotes = window.prompt("Catatan jurnal", notes);
    if (nextNotes === null) return;
    const nextSymptoms = window.prompt("Gejala, pisahkan dengan koma", symptoms.join(", "));
    if (nextSymptoms === null) return;
    setPending(true); setError("");
    try { await browserApi(`/pregnancy/journals/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ mood: nextMood, notes: nextNotes, symptoms: nextSymptoms.split(",").map((item) => item.trim()).filter(Boolean) }) }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Jurnal gagal diperbarui."); }
    finally { setPending(false); }
  }
  async function remove() {
    if (!window.confirm("Hapus jurnal ini?")) return;
    setPending(true); setError("");
    try { await browserApi(`/pregnancy/journals/${encodeURIComponent(id)}`, { method: "DELETE" }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Jurnal gagal dihapus."); }
    finally { setPending(false); }
  }
  return <div className="mt-4 border-t border-line pt-3"><div className="flex gap-4"><button disabled={pending} onClick={edit} className="text-xs font-bold text-brand">Ubah jurnal</button><button disabled={pending} onClick={remove} className="text-xs font-bold text-red-700">Hapus</button></div>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}

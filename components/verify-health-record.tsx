"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function VerifyHealthRecord({ path, label = "Verifikasi" }: { path: string; label?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function verify() {
    const note = window.prompt("Catatan verifikasi (opsional)") ?? "";
    setPending(true); setError("");
    try { await browserApi(path, { method: "POST", body: JSON.stringify(note.trim() ? { note: note.trim() } : {}) }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Verifikasi gagal."); }
    finally { setPending(false); }
  }
  return <div><button disabled={pending} onClick={verify} className="mt-2 text-xs font-bold text-teal-700 disabled:opacity-50">{pending ? "Menyimpan..." : label}</button>{error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}</div>;
}

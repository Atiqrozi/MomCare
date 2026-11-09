"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function NotificationRetry({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function retry() {
    setPending(true); setError("");
    try { await browserApi(`/notifications/${encodeURIComponent(id)}/retry`, { method: "POST" }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Pengiriman ulang gagal."); }
    finally { setPending(false); }
  }
  return <div className="text-right"><button disabled={pending} onClick={retry} className="text-xs font-bold text-brand disabled:opacity-50">{pending ? "Memproses..." : "Coba kirim ulang"}</button>{error && <p role="alert" className="mt-1 max-w-48 text-xs text-red-600">{error}</p>}</div>;
}

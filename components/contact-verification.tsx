"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserApi } from "@/lib/browser-api";

export function ContactVerification({ kind, verified }: { kind: "email" | "phone"; verified?: boolean }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const base = `/auth/verify-${kind}`;
  async function request() {
    setBusy(true); setMessage(""); setError("");
    try {
      const result = await browserApi<{ verificationToken?: string; message?: string }>(`${base}/request`, { method: "POST" });
      if (result?.verificationToken) setToken(result.verificationToken);
      setMessage(result?.message ?? "Permintaan verifikasi berhasil dibuat.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Token verifikasi gagal diminta."); }
    finally { setBusy(false); }
  }
  async function confirm() {
    setBusy(true); setMessage(""); setError("");
    try {
      await browserApi(`${base}/confirm`, { method: "POST", body: JSON.stringify({ token }) });
      setMessage(`${kind === "email" ? "Email" : "Nomor telepon"} berhasil diverifikasi.`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Verifikasi gagal."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold">{kind === "email" ? "Verifikasi email" : "Verifikasi nomor telepon"}: {verified ? "Terverifikasi" : "Belum terverifikasi"}</p>{!verified && <button disabled={busy} onClick={request} className="text-sm font-bold text-brand disabled:opacity-50">Kirim / buat token</button>}</div>{!verified && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={token} onChange={(event) => setToken(event.target.value)} className="field" placeholder="Token verifikasi" /><button disabled={busy || !token} onClick={confirm} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Konfirmasi</button></div>}{message && <p role="status" className="mt-2 text-xs text-emerald-700">{message}</p>}{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}

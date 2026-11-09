"use client";

import Link from "next/link";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function RegistrationVerificationForm({ email }: { email: string }) {
  const [emailValue, setEmailValue] = useState(email);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function verify() {
    setBusy(true); setError(""); setMessage("");
    try {
      await browserApi("/auth/registration/verify-email", { method: "POST", body: JSON.stringify({ email: emailValue, code }) });
      setVerified(true);
      setMessage("Email berhasil diverifikasi.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kode verifikasi tidak valid.");
    } finally { setBusy(false); }
  }

  async function resend() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await browserApi<{ message?: string; emailVerified?: boolean }>("/auth/registration/resend-codes", { method: "POST", body: JSON.stringify({ email: emailValue }) });
      setCode(""); setVerified(result.emailVerified ?? false);
      setMessage(result.message ?? "Jika email cocok dan verifikasi masih diperlukan, kode baru akan dikirim.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kode baru gagal dikirim.");
    } finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <p className="text-sm leading-6 text-slate-600">Masukkan kode 6 digit yang dikirim ke email Anda. Kode berlaku 15 menit. Nomor telepon belum memerlukan verifikasi.</p>
    <label className="block text-sm font-bold">Email<input type="email" required value={emailValue} onChange={(event) => setEmailValue(event.target.value)} className="field mt-2" /></label>
    <section className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold">Kode verifikasi email</p><div className="mt-3 flex gap-2"><input aria-label="Kode verifikasi email" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} disabled={verified} className="field" placeholder="6 digit" /><button onClick={verify} disabled={busy || verified || !emailValue || code.length !== 6} className="rounded-lg bg-brand px-4 text-sm font-bold text-white disabled:opacity-50">{verified ? "Terverifikasi" : "Verifikasi"}</button></div></section>
    {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {!verified && <button type="button" onClick={resend} disabled={busy || !emailValue} className="text-sm font-bold text-brand disabled:opacity-50">Kirim ulang kode</button>}
    {verified && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Verifikasi selesai. <Link href="/masuk" className="font-bold underline">Masuk ke akun</Link></div>}
  </div>;
}

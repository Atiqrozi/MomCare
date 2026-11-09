"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "./ui";

export function AuthForm({ mode, demoMode = false }: { mode: "login" | "register"; demoMode?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  async function submit(form: FormData) {
    setLoading(true); setError("");
    const body: Record<string, unknown> = Object.fromEntries(form.entries());
    if (mode === "login") setEmailForVerification(String(body.email ?? ""));
    if (mode === "register") body.consentGranted = form.get("consentGranted") === "on";
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Permintaan tidak dapat diproses");
      router.push("/beranda");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan"); } finally { setLoading(false); }
  }
  return <form action={submit} className="space-y-4">
    {demoMode && mode === "login" && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">Mode demo tidak menyimpan akun dan tidak menerima login contoh. Aktifkan backend untuk masuk menggunakan akun terdaftar.</p>}
    {mode === "register" && <label className="block text-sm font-bold">Nama lengkap<input name="fullName" required maxLength={120} className="field mt-2" placeholder="Nama Anda" /></label>}
    <label className="block text-sm font-bold">Email<input name="email" type="email" required className="field mt-2" placeholder="nama@email.com" /></label>
    {mode === "register" && <label className="block text-sm font-bold">Nomor telepon <span className="font-normal text-muted">(opsional)</span><input name="phone" className="field mt-2" placeholder="08xxxxxxxxxx" /></label>}
    <label className="block text-sm font-bold">Kata sandi<input name="password" type="password" required minLength={mode === "register" ? 8 : 1} className="field mt-2" placeholder="••••••••" /></label>
    {mode === "register" && <label className="flex items-start gap-3 text-sm text-muted"><input name="consentGranted" type="checkbox" required className="mt-1 accent-brand" /><span>Saya menyetujui penggunaan data untuk layanan MomCare.</span></label>}
    {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700"><p>{error}</p>{mode === "login" && error.toLowerCase().includes("verifikasi") && <Link href={`/verifikasi-akun?email=${encodeURIComponent(emailForVerification)}`} className="mt-2 inline-block font-bold underline">Verifikasi akun / kirim ulang kode</Link>}</div>}
    <Button type="submit" className="w-full">{loading ? "Memproses..." : mode === "login" ? "Masuk ke aplikasi" : "Buat akun"}</Button>
  </form>;
}

export function JournalForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(form: FormData) {
    setError("");
    try {
      const response = await fetch("/api/proxy/pregnancy/journals", { method: "POST", body: JSON.stringify({ entryDate: `${form.get("entryDate")}T00:00:00.000Z`, mood: form.get("mood"), notes: form.get("notes"), symptoms: String(form.get("symptoms") ?? "").split(",").map((v) => v.trim()).filter(Boolean) }) });
      if (!response.ok) throw new Error("Jurnal belum dapat disimpan. Coba lagi.");
      router.push("/kehamilan/jurnal");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan"); }
  }
  return <Card><form action={submit} className="max-w-2xl space-y-5"><label className="block text-sm font-bold">Tanggal<input name="entryDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="field mt-2" /></label><label className="block text-sm font-bold">Suasana hati<input name="mood" maxLength={50} className="field mt-2" placeholder="Contoh: Tenang" /></label><label className="block text-sm font-bold">Gejala <span className="font-normal text-muted">(pisahkan dengan koma, maksimal 20)</span><input name="symptoms" className="field mt-2" placeholder="Mudah lelah, mual" /></label><label className="block text-sm font-bold">Catatan <span className="font-normal text-muted">(maksimal 2.000 karakter)</span><textarea name="notes" maxLength={2000} rows={5} className="field mt-2" placeholder="Tuliskan catatan pribadi Anda..." /></label>{error && <p className="text-sm text-red-600">{error}</p>}<Button type="submit">Simpan jurnal</Button></form></Card>;
}

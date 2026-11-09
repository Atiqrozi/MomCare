"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui";

export function PregnancyRegistrationForm() {
  const router = useRouter();
  const [insuranceType, setInsuranceType] = useState<"BPJS" | "UMUM">("BPJS");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(form: FormData) {
    setLoading(true);
    setError("");
    const body = Object.fromEntries(form.entries());
    Object.assign(body, { insuranceType, consentGranted: form.get("consentGranted") === "on" });
    if (insuranceType === "UMUM") delete body.bpjsNumber;
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Registrasi gagal. Periksa kembali data Anda.");
      const query = new URLSearchParams({ email: String(body.email) });
      router.push(`/verifikasi-akun?${query.toString()}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  }

  return <form action={submit} className="space-y-4">
    <div className="border-b border-pink-100 pb-3"><h2 className="text-lg font-black text-slate-800">Registrasi Data Ibu Hamil</h2><p className="text-sm text-muted">Lengkapi identitas sesuai Buku KIA & Rekam Medis</p></div>
    <label className="block text-sm font-bold">NIK (Nomor Induk Kependudukan) *<input name="nik" inputMode="numeric" pattern="[0-9]{16}" maxLength={16} required className="field mt-2" placeholder="16 digit NIK KTP" /></label>
    <label className="block text-sm font-bold">Nama lengkap ibu *<input name="fullName" required maxLength={120} className="field mt-2" placeholder="Nama sesuai KTP" /></label>
    <fieldset><legend className="mb-2 text-sm font-bold">Jenis pembiayaan / kepesertaan layanan *</legend><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setInsuranceType("BPJS")} aria-pressed={insuranceType === "BPJS"} className={`rounded-xl border px-3 py-3 text-sm font-extrabold ${insuranceType === "BPJS" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>💳 BPJS / JKN</button><button type="button" onClick={() => setInsuranceType("UMUM")} aria-pressed={insuranceType === "UMUM"} className={`rounded-xl border px-3 py-3 text-sm font-extrabold ${insuranceType === "UMUM" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>🏥 Pasien Umum</button></div></fieldset>
    {insuranceType === "BPJS" && <label className="block text-sm font-bold text-emerald-800">Nomor kartu JKN / BPJS Kesehatan *<input name="bpjsNumber" inputMode="numeric" pattern="[0-9]{13}" maxLength={13} required className="field mt-2 border-emerald-200 bg-emerald-50/50" placeholder="13 digit nomor JKN / BPJS" /></label>}
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Tempat lahir *<input name="birthplace" required maxLength={100} className="field mt-2" placeholder="Kota kelahiran" /></label><label className="block text-sm font-bold">Tanggal lahir *<input name="birthDate" type="date" required className="field mt-2" /></label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Pendidikan terakhir<select name="education" className="field mt-2"><option value="">Pilih pendidikan</option>{["SD", "SMP", "SMA/SMK", "D3", "S1", "S2/S3"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-sm font-bold">Pekerjaan<input name="occupation" maxLength={120} className="field mt-2" placeholder="Pekerjaan ibu" /></label></div>
    <label className="block text-sm font-bold">Alamat lengkap domisili *<input name="address" required maxLength={500} className="field mt-2" placeholder="Jalan, RT/RW, kelurahan, kecamatan" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">No. HP / WhatsApp *<input name="phone" required inputMode="tel" maxLength={30} className="field mt-2" placeholder="08xxxxxxxxxx" /></label><label className="block text-sm font-bold">Golongan darah<select name="bloodType" className="field mt-2"><option value="">Belum diketahui</option>{["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((value) => <option key={value}>{value}</option>)}</select></label></div>
    <label className="block text-sm font-bold">Riwayat penyakit <span className="font-normal text-muted">(opsional)</span><textarea name="medicalHistory" maxLength={1000} rows={2} className="field mt-2" placeholder="Hipertensi, diabetes, asma, alergi, atau tidak ada" /></label>
    <label className="block text-sm font-bold">Hari pertama haid terakhir (HPHT) <span className="font-normal text-muted">(opsional)</span><input name="lmpDate" type="date" className="field mt-2" /></label>
    <label className="block text-sm font-bold">Email<input name="email" type="email" required maxLength={254} className="field mt-2" placeholder="nama@email.com" /></label>
    <label className="block text-sm font-bold">Kata sandi<input name="password" type="password" required minLength={8} maxLength={128} className="field mt-2" placeholder="Minimal 8 karakter" /></label>
    <label className="flex items-start gap-3 text-sm text-muted"><input name="consentGranted" type="checkbox" required className="mt-1 accent-brand" /><span>Saya menyetujui penggunaan data untuk layanan MomCare.</span></label>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button type="submit" disabled={loading} className="w-full">{loading ? "Memproses..." : "Simpan Registrasi & Masuk"}</Button>
  </form>;
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/types";
import { browserApi } from "@/lib/browser-api";
import { ContactVerification } from "@/components/contact-verification";

export function ProfileSettings({ user }: { user: User }) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState("");
  const [consentMessage, setConsentMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  async function saveProfile(form: FormData) {
    setError(""); setProfileMessage("");
    try {
      await browserApi("/auth/me", { method: "PATCH", body: JSON.stringify({ fullName: form.get("fullName"), phone: form.get("phone") || undefined }) });
      setProfileMessage("Profil berhasil diperbarui."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Profil gagal diperbarui."); }
  }
  async function updateConsent(form: FormData) {
    setError(""); setConsentMessage("");
    try {
      await browserApi("/auth/consent", { method: "PATCH", body: JSON.stringify({ granted: form.get("granted") === "on", version: "v1" }) });
      setConsentMessage("Persetujuan berhasil diperbarui."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Persetujuan gagal diperbarui."); }
  }
  async function changePassword(form: FormData) {
    setError(""); setPasswordMessage("");
    const next = String(form.get("newPassword") ?? "");
    if (next !== String(form.get("confirmPassword") ?? "")) { setError("Konfirmasi kata sandi baru tidak sama."); return; }
    try {
      await browserApi("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword: next }) });
      setPasswordMessage("Kata sandi berhasil diubah.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kata sandi gagal diubah."); }
  }
  return <div className="grid max-w-3xl gap-5">
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Informasi akun</h2><form action={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Nama lengkap<input name="fullName" required maxLength={120} defaultValue={user.fullName} className="field mt-2" /></label><label className="text-sm font-bold">Nomor telepon<input name="phone" maxLength={30} defaultValue={user.phone ?? ""} className="field mt-2" /></label><p className="text-sm text-muted sm:col-span-2">Email: {user.email ?? "—"}</p>{profileMessage && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{profileMessage}</p>}<button className="w-fit rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white">Simpan profil</button></form><ContactVerification kind="email" verified={user.emailVerified} />{user.phone && <ContactVerification kind="phone" verified={user.phoneVerified} />}</section>
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Persetujuan penggunaan data</h2><p className="mt-2 text-sm text-muted">Status persetujuan yang tercatat untuk akun Anda.</p><form action={updateConsent} className="mt-4 flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-sm font-semibold"><input name="granted" type="checkbox" defaultChecked={user.consentGranted} />Saya menyetujui penggunaan data untuk layanan MomCare.</label><button className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-brand">Perbarui persetujuan</button></form>{consentMessage && <p role="status" className="mt-3 text-sm text-emerald-700">{consentMessage}</p>}</section>
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Ubah kata sandi</h2><form action={changePassword} className="mt-4 grid gap-4"><label className="text-sm font-bold">Kata sandi saat ini<input name="currentPassword" type="password" required minLength={8} className="field mt-2" /></label><label className="text-sm font-bold">Kata sandi baru<input name="newPassword" type="password" required minLength={8} maxLength={128} className="field mt-2" /></label><label className="text-sm font-bold">Konfirmasi kata sandi baru<input name="confirmPassword" type="password" required minLength={8} className="field mt-2" /></label>{passwordMessage && <p role="status" className="text-sm text-emerald-700">{passwordMessage}</p>}<button className="w-fit rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-brand">Ubah kata sandi</button></form></section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>;
}

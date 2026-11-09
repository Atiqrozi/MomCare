"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

type UserRow = { id: string; fullName: string; email: string; role: string; status: string };
type FacilityRow = { _id: string; name: string; code: string; address: string; phone?: string; status?: string };
type AuditRow = { _id: string; action: string; resourceType: string; timestamp: string };

export function AdminConsole({ users: userRows, facilities: facilityRows, auditLogs: auditRows }: { users?: UserRow[]; facilities?: FacilityRow[]; auditLogs?: AuditRow[] }) {
  const users = Array.isArray(userRows) ? userRows : [];
  const facilities = Array.isArray(facilityRows) ? facilityRows : [];
  const auditLogs = Array.isArray(auditRows) ? auditRows : [];
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function createStaff(form: FormData) {
    setBusy(true); setError(""); setMessage("");
    try {
      await browserApi("/users/staff", { method: "POST", body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), phone: form.get("phone") || undefined, password: form.get("password"), role: form.get("role"), facilityId: form.get("facilityId") || undefined }) });
      setMessage("Akun staf berhasil dibuat."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Akun staf gagal dibuat."); }
    finally { setBusy(false); }
  }
  async function createFacility(form: FormData) {
    setBusy(true); setError(""); setMessage("");
    try {
      await browserApi("/facilities", { method: "POST", body: JSON.stringify({ name: form.get("facilityName"), code: form.get("code"), address: form.get("address"), phone: form.get("facilityPhone") || undefined }) });
      setMessage("Fasilitas berhasil ditambahkan."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Fasilitas gagal ditambahkan."); }
    finally { setBusy(false); }
  }
  async function disableUser(id: string) {
    if (!window.confirm("Nonaktifkan akun ini?")) return;
    setBusy(true); setError(""); setMessage("");
    try { await browserApi(`/users/${encodeURIComponent(id)}`, { method: "DELETE" }); setMessage("Akun berhasil dinonaktifkan."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Akun gagal dinonaktifkan."); }
    finally { setBusy(false); }
  }
  async function updateUserRole(id: string, role: string) {
    setBusy(true); setError(""); setMessage("");
    try { await browserApi(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ role }) }); setMessage("Peran akun berhasil diperbarui."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Peran akun gagal diperbarui."); }
    finally { setBusy(false); }
  }
  async function updateFacility(id: string, facility: FacilityRow) {
    const name = window.prompt("Nama fasilitas", facility.name);
    if (name === null) return;
    const address = window.prompt("Alamat fasilitas", facility.address);
    if (address === null) return;
    const phone = window.prompt("Telepon fasilitas", facility.phone ?? "");
    if (phone === null) return;
    setBusy(true); setError(""); setMessage("");
    try { await browserApi(`/facilities/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ name, address, phone: phone || undefined }) }); setMessage("Informasi fasilitas berhasil diperbarui."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Fasilitas gagal diperbarui."); }
    finally { setBusy(false); }
  }
  async function archiveFacility(id: string) {
    if (!window.confirm("Nonaktifkan fasilitas ini?")) return;
    setBusy(true); setError(""); setMessage("");
    try { await browserApi(`/facilities/${encodeURIComponent(id)}`, { method: "DELETE" }); setMessage("Fasilitas berhasil dinonaktifkan."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Fasilitas gagal dinonaktifkan."); }
    finally { setBusy(false); }
  }
  async function assignProvider(form: FormData) {
    setBusy(true); setError(""); setMessage("");
    try {
      const patientId = String(form.get("patientId"));
      await browserApi(`/users/patients/${encodeURIComponent(patientId)}/providers`, { method: "POST", body: JSON.stringify({ providerId: form.get("providerId") }) });
      setMessage("Tenaga kesehatan berhasil ditautkan ke pasien."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Penautan gagal."); }
    finally { setBusy(false); }
  }
  async function assignPatientFacility(form: FormData) {
    setBusy(true); setError(""); setMessage("");
    try {
      const patientId = String(form.get("patientId"));
      await browserApi(`/users/patients/${encodeURIComponent(patientId)}/facility`, { method: "PATCH", body: JSON.stringify({ facilityId: form.get("facilityId") }) });
      setMessage("Fasilitas pasien berhasil diperbarui."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan fasilitas gagal."); }
    finally { setBusy(false); }
  }
  async function unassignProvider(form: FormData) {
    setBusy(true); setError(""); setMessage("");
    try {
      const patientId = String(form.get("patientId"));
      const providerId = String(form.get("providerId"));
      await browserApi(`/users/patients/${encodeURIComponent(patientId)}/providers/${encodeURIComponent(providerId)}`, { method: "DELETE" });
      setMessage("Penugasan tenaga kesehatan berhasil dilepas."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Penugasan gagal dilepas."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    {(error || message) && <p role={error ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || message}</p>}
    <section className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Buat akun staf</h2><form action={createStaff} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field name="fullName" label="Nama lengkap" required maxLength={120} /><Field name="email" label="Email" required type="email" maxLength={254} /><Field name="phone" label="Telepon" maxLength={30} /><Field name="password" label="Kata sandi sementara" required type="password" minLength={8} maxLength={128} /><label className="text-sm font-bold">Peran<select name="role" required className="field mt-2">{[["DOCTOR", "Dokter"], ["MIDWIFE", "Bidan"], ["ADMIN", "Admin"], ["CONTENT_EDITOR", "Editor konten"], ["CLINICAL_REVIEWER", "Reviewer klinis"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-bold">Fasilitas (opsional)<select name="facilityId" className="field mt-2"><option value="">Tidak ditetapkan</option>{facilities.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><button disabled={busy} className="w-fit rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">Buat akun</button></form></section>
    <section className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Tambah fasilitas</h2><form action={createFacility} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field name="facilityName" label="Nama fasilitas" required maxLength={200} /><Field name="code" label="Kode" required maxLength={100} /><Field name="address" label="Alamat" required maxLength={500} /><Field name="facilityPhone" label="Telepon" maxLength={30} /><button disabled={busy} className="w-fit rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-700">Tambah fasilitas</button></form></section>
    <section className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Akun pengguna</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3">Nama</th><th className="pb-3">Email</th><th className="pb-3">Peran</th><th className="pb-3">Status</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{users.map((item) => <tr key={item.id}><td className="py-3 font-bold">{item.fullName}</td><td className="py-3">{item.email}</td><td className="py-3"><form action={(form) => updateUserRole(item.id, String(form.get("role")))} className="flex items-center gap-2"><select name="role" defaultValue={item.role} className="field max-w-48 py-2 text-xs">{[["PREGNANT_MOTHER", "Ibu hamil"], ["DOCTOR", "Dokter"], ["MIDWIFE", "Bidan"], ["ADMIN", "Admin"], ["CONTENT_EDITOR", "Editor konten"], ["CLINICAL_REVIEWER", "Reviewer klinis"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button disabled={busy} className="text-xs font-bold text-teal-700">Simpan</button></form></td><td className="py-3">{item.status}</td><td className="py-3 text-right">{item.status === "ACTIVE" && <button disabled={busy} onClick={() => disableUser(item.id)} className="font-bold text-red-700">Nonaktifkan</button>}</td></tr>)}</tbody></table></div></section>
    <section className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Penugasan layanan</h2><div className="mt-4 grid gap-5 lg:grid-cols-3"><form action={assignProvider} className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Pasien<select required name="patientId" className="field mt-2"><option value="">Pilih pasien</option>{users.filter((item) => item.role === "PREGNANT_MOTHER").map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><label className="text-sm font-bold">Dokter / bidan<select required name="providerId" className="field mt-2"><option value="">Pilih nakes</option>{users.filter((item) => ["DOCTOR", "MIDWIFE"].includes(item.role) && item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.role}</option>)}</select></label><button disabled={busy} className="w-fit rounded-lg border border-teal-700 px-3 py-2 text-xs font-bold text-teal-700 sm:col-span-2">Tautkan tenaga kesehatan</button></form><form action={unassignProvider} className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Pasien<select required name="patientId" className="field mt-2"><option value="">Pilih pasien</option>{users.filter((item) => item.role === "PREGNANT_MOTHER").map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><label className="text-sm font-bold">Dokter / bidan<select required name="providerId" className="field mt-2"><option value="">Pilih nakes</option>{users.filter((item) => ["DOCTOR", "MIDWIFE"].includes(item.role)).map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><button disabled={busy} className="w-fit rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-700 sm:col-span-2">Lepas penugasan</button></form><form action={assignPatientFacility} className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Pasien<select required name="patientId" className="field mt-2"><option value="">Pilih pasien</option>{users.filter((item) => item.role === "PREGNANT_MOTHER").map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><label className="text-sm font-bold">Fasilitas<select required name="facilityId" className="field mt-2"><option value="">Pilih fasilitas</option>{facilities.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><button disabled={busy} className="w-fit rounded-lg border border-teal-700 px-3 py-2 text-xs font-bold text-teal-700 sm:col-span-2">Tetapkan fasilitas</button></form></div></section>
    <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Fasilitas aktif</h2><div className="mt-3 space-y-3">{facilities.map((item) => <div key={item._id} className="border-t border-slate-100 pt-3"><p className="font-bold">{item.name} <span className="text-xs text-slate-400">{item.code}</span></p><p className="text-sm text-slate-500">{item.address}</p><div className="mt-2 flex gap-4"><button disabled={busy} onClick={() => updateFacility(item._id, item)} className="text-xs font-bold text-teal-700">Ubah</button><button disabled={busy} onClick={() => archiveFacility(item._id)} className="text-xs font-bold text-red-700">Nonaktifkan</button></div></div>)}</div></div><div className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Audit terbaru</h2><div className="mt-3 space-y-3">{auditLogs.map((item) => <div key={item._id} className="border-t border-slate-100 pt-3"><p className="font-bold">{item.action}</p><p className="text-xs text-slate-500">{item.resourceType} · {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.timestamp))}</p></div>)}</div></div></section>
  </div>;
}

function Field({ name, label, required, type = "text", maxLength, minLength }: { name: string; label: string; required?: boolean; type?: string; maxLength: number; minLength?: number }) {
  return <label className="text-sm font-bold">{label}<input name={name} type={type} required={required} maxLength={maxLength} minLength={minLength} className="field mt-2" /></label>;
}

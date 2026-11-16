"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

type Service = { _id: string; name: string; slug: string; description: string; department: string; addressOrLocation: string; contactPhone?: string; operatingHours?: string; instructions?: string; status: string };

export function HospitalServiceConsole({ services: serviceRows }: { services?: Service[] }) {
  const services = Array.isArray(serviceRows) ? serviceRows : [];
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(form: FormData) {
    setBusy(true); setError(""); setMessage("");
    const name = String(form.get("name") ?? "");
    const slug = String(form.get("slug") ?? "") || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const body = Object.fromEntries(form.entries());
    try { await browserApi("/hospital-services", { method: "POST", body: JSON.stringify({ ...body, slug, contactPhone: body.contactPhone || undefined, operatingHours: body.operatingHours || undefined, instructions: body.instructions || undefined }) }); setMessage("Draf layanan berhasil dibuat."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Layanan gagal dibuat."); }
    finally { setBusy(false); }
  }
  async function action(id: string, name: string, body?: object, method: "POST" | "PATCH" | "DELETE" = "POST") {
    setBusy(true); setError(""); setMessage("");
    try { await browserApi(`/hospital-services/${encodeURIComponent(id)}${name && name !== "update" ? `/${name}` : ""}`, { method, ...(body ? { body: JSON.stringify(body) } : {}) }); setMessage("Layanan berhasil diperbarui."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan gagal disimpan."); }
    finally { setBusy(false); }
  }
  async function updateDescription(service: Service) {
    const description = window.prompt("Deskripsi layanan", service.description);
    if (description?.trim()) await action(service._id, "update", { description }, "PATCH");
  }
  return <div className="space-y-5">
    {(error || message) && <p role={error ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || message}</p>}
    <section className="rounded-2xl border border-slate-100 bg-white p-5"><h2 className="text-lg font-black">Tambah draf layanan</h2><form action={create} className="mt-4 grid gap-3 md:grid-cols-2"><Field name="name" label="Nama layanan" required maxLength={200} /><Field name="slug" label="Slug (opsional)" maxLength={200} /><Field name="department" label="Departemen" required maxLength={120} /><Field name="addressOrLocation" label="Lokasi / alamat" required maxLength={500} /><Field name="contactPhone" label="Telepon" maxLength={30} /><Field name="operatingHours" label="Jam operasional" maxLength={1000} /><label className="text-sm font-bold md:col-span-2">Deskripsi<textarea name="description" required maxLength={2000} rows={3} className="field mt-2" /></label><label className="text-sm font-bold md:col-span-2">Petunjuk<textarea name="instructions" maxLength={2000} rows={3} className="field mt-2" /></label><button disabled={busy} className="w-fit rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">Simpan draf</button></form></section>
    <div className="grid gap-4 md:grid-cols-2">{services.map((service) => <article key={service._id} className="rounded-2xl border border-slate-100 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-teal-700">{service.department}</p><h2 className="mt-1 font-black">{service.name}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{service.status}</span></div><p className="mt-3 text-sm text-slate-600">{service.description}</p><p className="mt-2 text-xs text-slate-500">{service.addressOrLocation} · {service.operatingHours ?? "Jam operasional belum diatur"}</p><div className="mt-4 flex flex-wrap gap-2">{service.status !== "published" && <button disabled={busy} onClick={() => action(service._id, "publish")} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white">Terbitkan</button>}<button disabled={busy} onClick={() => updateDescription(service)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Ubah deskripsi</button>{service.status !== "archived" && <button disabled={busy} onClick={() => { if (window.confirm("Arsipkan layanan ini?")) void action(service._id, "", undefined, "DELETE"); }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Arsipkan</button>}</div></article>)}</div>
  </div>;
}

function Field({ name, label, required, maxLength }: { name: string; label: string; required?: boolean; maxLength: number }) { return <label className="text-sm font-bold">{label}<input name={name} required={required} maxLength={maxLength} className="field mt-2" /></label>; }

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function EducationCreateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(form: FormData) {
    setPending(true); setError("");
    const title = String(form.get("title") ?? "");
    const slug = String(form.get("slug") ?? "") || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      await browserApi("/education", { method: "POST", body: JSON.stringify({ title, slug, summary: form.get("summary"), body: form.get("body"), category: form.get("category"), sourceTitle: form.get("sourceTitle"), sourceUrl: form.get("sourceUrl") || undefined, sourceVersion: form.get("sourceVersion") || undefined }) });
      router.push("/dashboard/edukasi"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Draf materi gagal dibuat."); }
    finally { setPending(false); }
  }
  return <form action={submit} className="grid gap-4 md:grid-cols-2"><Field name="title" label="Judul" required maxLength={200} /><Field name="slug" label="Slug (opsional)" maxLength={200} /><Field name="category" label="Kategori" required maxLength={100} /><Field name="sourceTitle" label="Judul sumber" required maxLength={200} /><Field name="sourceVersion" label="Versi sumber" maxLength={100} /><Field name="sourceUrl" label="URL sumber" type="url" maxLength={1000} /><Field name="summary" label="Ringkasan" required maxLength={500} /><label className="text-sm font-bold md:col-span-2">Isi materi<textarea name="body" required maxLength={20000} rows={10} className="field mt-2" /></label>{error && <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>}<button disabled={pending} className="w-fit rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "Menyimpan..." : "Simpan draf"}</button></form>;
}

function Field({ name, label, required, maxLength, type = "text" }: { name: string; label: string; required?: boolean; maxLength: number; type?: string }) {
  return <label className="text-sm font-bold">{label}<input name={name} type={type} required={required} maxLength={maxLength} className="field mt-2" /></label>;
}

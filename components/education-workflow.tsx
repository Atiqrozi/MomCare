"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";
import type { Role } from "@/lib/types";

type Item = { _id: string; title: string; summary: string; body: string; category: string; status: string; reviewNote?: string; sourceVersion?: string };

export function EducationWorkflow({ items, role }: { items: Item[]; role: Role }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  async function action(id: string, name: string, body?: object) {
    setPending(id + name); setError("");
    try { await browserApi(`/education/${encodeURIComponent(id)}/${name}`, { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan gagal disimpan."); }
    finally { setPending(""); }
  }
  async function editDraft(item: Item) {
    const title = window.prompt("Judul materi", item.title);
    if (title === null) return;
    const summary = window.prompt("Ringkasan materi", item.summary);
    if (summary === null) return;
    const body = window.prompt("Isi materi", item.body);
    if (body === null) return;
    setPending(item._id); setError("");
    try { await browserApi(`/education/${encodeURIComponent(item._id)}`, { method: "PATCH", body: JSON.stringify({ title, summary, body }) }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Draf gagal diperbarui."); }
    finally { setPending(""); }
  }
  const publisher = role === "CONTENT_EDITOR" || role === "ADMIN";
  const reviewer = role === "CLINICAL_REVIEWER";
  return <div className="space-y-4">{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{items.map((item) => <article key={item._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">{item.category}</p><h2 className="mt-1 text-lg font-black">{item.title}</h2><p className="mt-2 text-sm text-slate-500">{item.summary}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{item.status}</span></div>{item.reviewNote && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Catatan review: {item.reviewNote}</p>}<div className="mt-4 flex flex-wrap gap-2">{role === "CONTENT_EDITOR" && item.status === "draft" && <><button disabled={!!pending} onClick={() => editDraft(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Ubah draf</button><button disabled={!!pending} onClick={() => action(item._id, "submit-review")} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white">Ajukan review</button></>}{reviewer && item.status === "in_review" && <><button disabled={!!pending} onClick={() => action(item._id, "approve")} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white">Setujui</button><button disabled={!!pending} onClick={() => { const note = window.prompt("Catatan untuk editor"); if (note?.trim()) void action(item._id, "reject", { note }); }} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800">Kembalikan ke editor</button></>}{publisher && item.status === "approved" && <button disabled={!!pending} onClick={() => action(item._id, "publish", { sourceVersion: item.sourceVersion })} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white">Terbitkan</button>}{(role === "CONTENT_EDITOR" || reviewer) && item.status === "published" && <button disabled={!!pending} onClick={() => action(item._id, "archive")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Arsipkan</button>}</div></article>)}{items.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Belum ada materi untuk ditampilkan.</p>}</div>;
}

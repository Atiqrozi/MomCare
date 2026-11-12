"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { JournalForm } from "@/components/forms";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function JournalActions({ id, entryDate, mood = "", notes = "", symptoms = [] }: { id: string; entryDate: string; mood?: string; notes?: string; symptoms?: string[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  async function remove() {
    setPending(true); setError("");
    try { await browserApi(`/pregnancy/journals/${encodeURIComponent(id)}`, { method: "DELETE" }); setDeleteConfirm(false); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Jurnal gagal dihapus."); }
    finally { setPending(false); }
  }
  return <div className="mt-4 border-t border-line pt-3">{editing ? <JournalForm key={id} journalId={id} initialData={{ entryDate, mood, notes, symptoms }} onCancel={() => setEditing(false)} /> : <div className="flex gap-4"><button disabled={pending} onClick={() => setEditing(true)} className="text-xs font-bold text-brand">Ubah jurnal</button><button disabled={pending} onClick={() => setDeleteConfirm(true)} className="text-xs font-bold text-red-700">Hapus</button></div>}{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}{deleteConfirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setDeleteConfirm(false); }}><section role="alertdialog" aria-modal="true" aria-labelledby={`delete-journal-title-${id}`} aria-describedby={`delete-journal-description-${id}`} className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-6 shadow-2xl shadow-pink-200/50"><div className="flex items-start justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-pink-50 text-pink-600"><AlertTriangle className="size-6" /></div><button type="button" disabled={pending} aria-label="Tutup dialog" onClick={() => setDeleteConfirm(false)} className="rounded-full p-2 text-slate-400 hover:bg-pink-50 hover:text-pink-600 disabled:opacity-50"><X className="size-5" /></button></div><h2 id={`delete-journal-title-${id}`} className="mt-5 text-xl font-black text-slate-900">Hapus jurnal ini?</h2><p id={`delete-journal-description-${id}`} className="mt-2 leading-6 text-slate-600">Catatan yang dihapus tidak dapat dipulihkan. Apakah Anda yakin ingin melanjutkan?</p>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={pending} onClick={() => setDeleteConfirm(false)} className="rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-pink-50 disabled:opacity-50">Batal</button><button type="button" disabled={pending} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-700 disabled:opacity-50"><Trash2 className="size-4" />{pending ? "Menghapus..." : "Hapus jurnal"}</button></div></section></div>}</div>;
}

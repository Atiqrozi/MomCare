"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { browserApi } from "@/lib/browser-api";
import { Card } from "./ui";

type Patient = { userId: string; patient?: { fullName?: string }; latestRiskAssessment?: { level: string; mapMmHg: number; assessedAt: string; reasons: string[] } | null };
type Conversation = { _id: string; patientId: string; providerId?: string; kind: string; lastMessageAt: string };
type ChatMessage = { _id: string; senderRole: string; text: string; createdAt: string };

export function RiskScreening() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [protein, setProtein] = useState("0");
  const [signs, setSigns] = useState<string[]>([]);
  const [result, setResult] = useState<{ assessment: { mapMmHg: number; level: string; reasons: string[] }; nextStep: string; disclaimer: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { browserApi<Patient[]>("/dashboard/patients?limit=100").then((data) => { setPatients(data); if (data[0]) setPatientId(data[0].userId); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Daftar pasien gagal dimuat.")); }, []);
  function toggle(sign: string) { setSigns((current) => current.includes(sign) ? current.filter((item) => item !== sign) : [...current, sign]); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setResult(null);
    try {
      const data = await browserApi<typeof result>("/risk-assessments/evaluate", { method: "POST", body: JSON.stringify({ patientId, systolicMmHg: Number(systolic), diastolicMmHg: Number(diastolic), urineProteinPlus: Number(protein), warningSigns: signs }) });
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Penilaian gagal disimpan."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5"><Card><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">Pasien<select required value={patientId} onChange={(event) => setPatientId(event.target.value)} className="field mt-2">{patients.map((patient) => <option key={patient.userId} value={patient.userId}>{patient.patient?.fullName ?? patient.userId}</option>)}</select></label><label className="text-sm font-bold">Tekanan sistolik (mmHg)<input type="number" min={40} max={300} required value={systolic} onChange={(event) => setSystolic(event.target.value)} className="field mt-2" /></label><label className="text-sm font-bold">Tekanan diastolik (mmHg)<input type="number" min={20} max={200} required value={diastolic} onChange={(event) => setDiastolic(event.target.value)} className="field mt-2" /></label><label className="text-sm font-bold sm:col-span-2">Protein urine<select value={protein} onChange={(event) => setProtein(event.target.value)} className="field mt-2"><option value="0">Negatif</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label><fieldset className="sm:col-span-2"><legend className="text-sm font-bold">Tanda bahaya yang dilaporkan</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{[["severe_headache", "Sakit kepala berat"], ["visual_changes", "Gangguan penglihatan"], ["upper_abdominal_pain", "Nyeri perut bagian atas"], ["shortness_of_breath", "Sesak napas"]].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={signs.includes(value)} onChange={() => toggle(value)} />{label}</label>)}</div></fieldset><button disabled={busy || !patientId} className="w-fit rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Menghitung..." : "Simpan hasil skrining"}</button></form></Card>
    {error && <Card className="border-red-200 bg-red-50 text-sm text-red-800">{error}</Card>}{result && <Card className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-black">Hasil skrining: {result.assessment.level.replaceAll("_", " ").toUpperCase()}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">MAP {result.assessment.mapMmHg} mmHg</span></div>{result.assessment.reasons.length > 0 ? <ul className="list-disc space-y-1 pl-5 text-sm">{result.assessment.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <p className="text-sm">Tidak ada pemicu skrining pada data yang dimasukkan.</p>}<p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{result.nextStep}</p><p className="text-xs text-muted">{result.disclaimer}</p></Card>}
    <Card><h2 className="font-black">Pasien & skrining terakhir</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Nama pasien</th><th className="pb-3">Status terakhir</th><th className="pb-3">MAP</th><th className="pb-3">Tanggal</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{patients.map((patient) => <tr key={patient.userId}><td className="py-3 font-bold">{patient.patient?.fullName ?? "Pasien"}</td><td className="py-3">{patient.latestRiskAssessment?.level.replaceAll("_", " ") ?? "Belum dinilai"}</td><td className="py-3">{patient.latestRiskAssessment?.mapMmHg ?? "—"} mmHg</td><td className="py-3 text-slate-500">{patient.latestRiskAssessment ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(patient.latestRiskAssessment.assessedAt)) : "—"}</td><td className="py-3 text-right"><Link href={`/dashboard/pasien/${encodeURIComponent(patient.userId)}`} className="font-bold text-blue-700">Cek RM</Link></td></tr>)}</tbody></table></div></Card>
    <p className="text-xs leading-5 text-muted">Skrining pendukung, bukan diagnosis. Nilai tekanan darah berat (≥160 sistolik atau ≥110 diastolik) maupun gejala tanda bahaya perlu penilaian klinis segera sesuai protokol fasilitas.</p>
  </div>;
}

export function StaffChatInbox() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [patientId, setPatientId] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const [patientData, conversationData] = await Promise.all([browserApi<Patient[]>("/dashboard/patients?limit=100"), browserApi<Conversation[]>("/chat/conversations")]);
    setPatients(patientData); setConversations(conversationData);
  }
  useEffect(() => { refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "Kotak masuk gagal dimuat.")); }, []);
  async function openConversation(id: string) {
    setActive(id); setError("");
    try { const result = await browserApi<ChatMessage[]>(`/chat/conversations/${encodeURIComponent(id)}/messages?limit=100`); setMessages(result); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Pesan gagal dimuat."); }
  }
  async function startConversation() {
    if (!patientId) return;
    setError("");
    try { const result = await browserApi<Conversation>("/chat/conversations", { method: "POST", body: JSON.stringify({ kind: "CARE_TEAM", participantId: patientId }) }); setConversations((old) => [result, ...old.filter((item) => item._id !== result._id)]); await openConversation(result._id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Percakapan gagal dibuka."); }
  }
  async function send(event: FormEvent) {
    event.preventDefault(); if (!active || !text.trim()) return;
    setBusy(true); setError("");
    try { const message = await browserApi<ChatMessage>(`/chat/conversations/${encodeURIComponent(active)}/messages`, { method: "POST", body: JSON.stringify({ text: text.trim() }) }); setMessages((old) => [...old, message]); setText(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Pesan gagal dikirim."); }
    finally { setBusy(false); }
  }
  const patientName = (id: string) => patients.find((patient) => patient.userId === id)?.patient?.fullName ?? "Pasien";
  return <div className="grid gap-5 lg:grid-cols-[300px_1fr]"><Card className="space-y-4"><h2 className="font-black">Pasien</h2><div className="flex gap-2"><select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="field min-w-0"><option value="">Pilih pasien</option>{patients.map((patient) => <option key={patient.userId} value={patient.userId}>{patient.patient?.fullName ?? patient.userId}</option>)}</select><button onClick={startConversation} className="rounded-xl bg-teal-700 px-3 text-xs font-bold text-white">Buka</button></div><h3 className="pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Percakapan</h3>{conversations.filter((item) => item.kind === "CARE_TEAM").map((item) => <button key={item._id} onClick={() => openConversation(item._id)} className={`block w-full rounded-xl p-3 text-left text-sm ${active === item._id ? "bg-teal-50 text-teal-900" : "bg-slate-50"}`}>{patientName(item.patientId)}</button>)}</Card><Card className="flex min-h-[460px] flex-col"><div className="border-b border-slate-100 pb-3 font-black">{active ? patientName(conversations.find((item) => item._id === active)?.patientId ?? patientId) : "Pilih percakapan"}</div><div className="flex-1 space-y-3 overflow-y-auto py-4" aria-live="polite">{messages.map((message) => <div key={message._id} className={`max-w-[85%] rounded-xl p-3 text-sm ${message.senderRole === "PREGNANT_MOTHER" ? "bg-slate-100" : "ml-auto bg-teal-700 text-white"}`}>{message.text}</div>)}</div><form onSubmit={send} className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} maxLength={4000} disabled={!active} className="field" placeholder="Tulis balasan..." /><button disabled={!active || busy} className="rounded-xl bg-teal-700 px-4 text-sm font-bold text-white disabled:opacity-50">Kirim</button></form>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</Card></div>;
}

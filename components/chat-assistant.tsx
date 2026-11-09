"use client";

import { FormEvent, useEffect, useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { browserApi } from "@/lib/browser-api";
import { Card } from "./ui";

type Conversation = { _id: string };
type AppointmentPayload = {
  appointmentId: string;
  scheduledAt: string;
  rescheduleDeadline: string;
  providerName: string;
  facilityName: string;
  visitType: string;
  resolvedAction?: string;
};
type ChatMessage = {
  _id: string;
  senderRole: string;
  text: string;
  createdAt: string;
  messageType?: "text" | "appointment_reminder" | "appointment_result";
  payload?: AppointmentPayload;
};
type MessageList = { data: ChatMessage[] };
type ApiAppointmentAction = { resultMessage?: ChatMessage };
type AppointmentSlot = { startsAt: string; endsAt: string; durationMinutes: number };
type AppointmentSlotList = { slots: AppointmentSlot[]; message?: string };

export function ChatAssistant() {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const conversation = await browserApi<Conversation>("/chat/conversations", { method: "POST", body: JSON.stringify({ kind: "AI", title: "Konsultasi MOMENT AI" }) });
        if (cancelled) return;
        setConversationId(conversation._id);
        const history = await browserApi<MessageList>(`/chat/conversations/${encodeURIComponent(conversation._id)}/messages?limit=100`);
        if (!cancelled) setMessages(history.data ?? []);
      } catch (cause) { if (!cancelled) setError(cause instanceof Error ? cause.message : "Chat belum dapat dimuat."); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const history = await browserApi<MessageList>(`/chat/conversations/${encodeURIComponent(conversationId)}/messages?limit=100`);
        if (!cancelled) setMessages((current) => mergeMessages(current, history.data ?? []));
      } catch { /* Chat can retry on the next poll. */ }
    };
    const timer = window.setInterval(refresh, 15_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [conversationId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || !conversationId || busy) return;
    setBusy(true); setError("");
    try {
      const result = await browserApi<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST", body: JSON.stringify({ text: text.trim(), consentToAiProcessing: consent }),
      });
      setMessages((current) => mergeMessages(current, [result.userMessage, result.assistantMessage]));
      setText("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pesan gagal dikirim."); }
    finally { setBusy(false); }
  }

  function appendMessage(message?: ChatMessage) {
    if (message) setMessages((current) => mergeMessages(current, [message]));
  }

  return <Card className="mt-6 max-w-3xl"><div className="flex items-center gap-3 border-b border-line pb-4"><div className="grid size-11 place-items-center rounded-full bg-mint text-brand"><Sparkles /></div><div><h2 className="font-black"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span> Assistant</h2><p className="text-xs text-muted">Informasi pendamping kehamilan</p></div></div>
    <div className="my-5 max-h-[55vh] space-y-3 overflow-y-auto" aria-live="polite">{messages.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6">Halo Bunda. Tanyakan informasi umum tentang kehamilan atau persiapan kunjungan ANC. Chat ini bukan layanan gawat darurat.</p>}{messages.map((message) => message.messageType === "appointment_reminder" && message.payload
      ? <AppointmentReminderCard key={message._id} conversationId={conversationId} message={message} onResult={appendMessage} />
      : <div key={message._id} className={`max-w-[88%] rounded-2xl p-4 text-sm leading-6 ${message.senderRole === "ASSISTANT" ? "bg-slate-50" : "ml-auto bg-brand text-white"}`}>{message.text}</div>)}</div>
    <form onSubmit={send} className="space-y-3"><textarea className="field" rows={3} value={text} maxLength={4000} onChange={(event) => setText(event.target.value)} placeholder="Tulis pertanyaan..." /><label className="flex items-start gap-2 text-xs leading-5 text-muted"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-brand" /><span>Saya setuju isi pesan diproses oleh penyedia AI yang dikonfigurasi untuk MomCare.</span></label><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-xs text-muted"><MessageCircle className="size-4 text-brand" />Bukan pengganti tenaga kesehatan.</p><button disabled={busy || !conversationId} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Send className="size-4" />{busy ? "Mengirim..." : "Kirim"}</button></div></form>
    {error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    <p className="mt-3 text-xs text-muted">Jawaban AI bersifat informasional, bukan diagnosis atau pengganti keputusan tenaga kesehatan. Untuk gejala berat, segera hubungi fasilitas kesehatan.</p>
  </Card>;
}

function AppointmentReminderCard({ conversationId, message, onResult }: { conversationId: string; message: ChatMessage; onResult: (message?: ChatMessage) => void }) {
  const [selectingDate, setSelectingDate] = useState(false);
  const [date, setDate] = useState(jakartaDate(new Date()));
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const payload = message.payload!;
  const resolved = Boolean(payload.resolvedAction);
  const maxDate = jakartaDate(new Date(payload.rescheduleDeadline));
  const scheduledAt = new Date(payload.scheduledAt);

  async function confirm() {
    setPending(true); setNotice("");
    try {
      const result = await browserApi<ApiAppointmentAction>(`/chat/conversations/${encodeURIComponent(conversationId)}/appointment-actions/confirm`, {
        method: "POST", body: JSON.stringify({ appointmentId: payload.appointmentId, reminderMessageId: message._id }),
      });
      onResult(result.resultMessage);
      setNotice("Kehadiran berhasil dikonfirmasi.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Konfirmasi belum berhasil."); }
    finally { setPending(false); }
  }

  async function findSlots(event: FormEvent) {
    event.preventDefault(); setPending(true); setNotice(""); setSlots([]);
    try {
      const result = await browserApi<AppointmentSlotList>(`/chat/conversations/${encodeURIComponent(conversationId)}/appointment-actions/reschedule-options`, {
        method: "POST", body: JSON.stringify({ appointmentId: payload.appointmentId, reminderMessageId: message._id, date }),
      });
      setSlots(result.slots ?? []);
      if (result.message) setNotice(result.message);
      else if (!result.slots?.length) setNotice("Tidak ada slot yang tersedia pada tanggal tersebut.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Jadwal dokter belum dapat diperiksa."); }
    finally { setPending(false); }
  }

  async function reschedule(slot: AppointmentSlot) {
    setPending(true); setNotice("");
    try {
      const result = await browserApi<ApiAppointmentAction>(`/chat/conversations/${encodeURIComponent(conversationId)}/appointment-actions/reschedule`, {
        method: "POST", body: JSON.stringify({ appointmentId: payload.appointmentId, reminderMessageId: message._id, scheduledAt: slot.startsAt }),
      });
      onResult(result.resultMessage);
      setSelectingDate(false);
      setNotice("Jadwal konsultasi berhasil diubah.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Perubahan jadwal belum berhasil. Coba muat ulang pilihan slot."); }
    finally { setPending(false); }
  }

  return <article className="max-w-[94%] rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-sm shadow-sm">
    <p className="text-[11px] font-extrabold uppercase tracking-wide text-blue-700">Pengingat konsultasi ANC</p>
    <p className="mt-2 leading-6 text-slate-800">{message.text}</p>
    <dl className="mt-3 grid gap-1 text-xs text-slate-600"><div><dt className="inline font-bold">Dokter: </dt><dd className="inline">{payload.providerName}</dd></div><div><dt className="inline font-bold">Jadwal: </dt><dd className="inline">{formatJakartaDate(scheduledAt)} pukul {formatJakartaTime(scheduledAt)} WIB</dd></div><div><dt className="inline font-bold">Lokasi: </dt><dd className="inline">{payload.facilityName}</dd></div></dl>
    {resolved && <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700">Tindakan pengingat ini sudah diproses.</p>}
    {!resolved && <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={pending} onClick={confirm} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{pending ? "Memproses..." : "Bisa hadir"}</button><button type="button" disabled={pending} onClick={() => { setSelectingDate((value) => !value); setSlots([]); setNotice(""); }} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 disabled:opacity-50">Jadwalkan ulang</button></div>}
    {!resolved && selectingDate && <form onSubmit={findSlots} className="mt-4 rounded-xl border border-blue-100 bg-white p-3"><label className="block text-xs font-bold text-slate-600">Pilih tanggal baru (maksimal 7 hari)<input type="date" required min={jakartaDate(new Date())} max={maxDate} value={date} onChange={(event) => setDate(event.target.value)} className="field mt-1 !bg-white" /></label><button disabled={pending} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{pending ? "Memeriksa jadwal..." : "Cari slot dokter"}</button>
      {slots.length > 0 && <div className="mt-3"><p className="text-xs font-bold text-slate-600">Pilih jam yang tersedia:</p><div className="mt-2 flex flex-wrap gap-2">{slots.map((slot) => <button key={slot.startsAt} type="button" disabled={pending} onClick={() => reschedule(slot)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 disabled:opacity-50">{formatJakartaTime(new Date(slot.startsAt))} WIB</button>)}</div></div>}</form>}
    {notice && <p role="status" className="mt-3 text-xs font-semibold text-slate-700">{notice}</p>}
  </article>;
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map(current.map((message) => [message._id, message]));
  for (const message of incoming) byId.set(message._id, message);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-100);
}

function jakartaDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatJakartaDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatJakartaTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
}

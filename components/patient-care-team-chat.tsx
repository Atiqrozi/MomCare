"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { browserApi } from "@/lib/browser-api";
import { Card } from "./ui";

type Conversation = { _id: string; kind: string; title?: string; providerName?: string };
type ChatMessage = { _id: string; senderRole: string; text: string; createdAt: string };

export function PatientCareTeamChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshConversations = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const items = await browserApi<Conversation[]>("/chat/conversations");
      const careTeamItems = items.filter((item) => item.kind === "CARE_TEAM");
      setConversations(careTeamItems);
      setActiveId((current) => careTeamItems.some((item) => item._id === current) ? current : careTeamItems[0]?._id ?? "");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pesan tenaga kesehatan gagal dimuat.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshConversations(true);
    const timer = window.setInterval(() => { void refreshConversations(); }, 15_000);
    return () => window.clearInterval(timer);
  }, [refreshConversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const loadMessages = async () => {
      try {
        const items = await browserApi<ChatMessage[]>(`/chat/conversations/${encodeURIComponent(activeId)}/messages?limit=100`);
        if (!cancelled) {
          setMessages(items);
          setError("");
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Pesan percakapan gagal dimuat.");
      }
    };
    void loadMessages();
    const timer = window.setInterval(() => { void loadMessages(); }, 8_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [activeId]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeId || !text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const message = await browserApi<ChatMessage>(`/chat/conversations/${encodeURIComponent(activeId)}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim() }),
      });
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
      setText("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pesan gagal dikirim.");
    } finally {
      setBusy(false);
    }
  }

  const activeConversation = conversations.find((item) => item._id === activeId);
  return <Card className="flex min-h-[460px] flex-col">
    <div className="flex items-center gap-3 border-b border-line pb-4">
      <div className="grid size-11 place-items-center rounded-full bg-teal-50 text-teal-700"><MessageCircle /></div>
      <div><h2 className="font-black">Pesan tenaga kesehatan</h2><p className="text-xs text-muted">Pesan dari bidan, dokter, atau admin yang menangani Bunda.</p></div>
    </div>
    {loading ? <div className="grid flex-1 place-items-center py-12 text-sm text-muted">Memuat percakapan…</div> : conversations.length === 0 ? <div className="grid flex-1 place-items-center py-12 text-center"><div><p className="font-bold text-slate-700">Belum ada pesan dari tenaga kesehatan</p><p className="mt-2 max-w-md text-sm leading-6 text-muted">Pesan akan muncul di sini saat tenaga kesehatan menghubungi Bunda melalui menu Konsultasi.</p></div></div> : <>
      {conversations.length > 1 && <div className="flex gap-2 overflow-x-auto border-b border-slate-100 py-3">{conversations.map((item) => <button type="button" key={item._id} onClick={() => setActiveId(item._id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${activeId === item._id ? "bg-teal-50 text-teal-800" : "bg-slate-50 text-slate-600"}`}>{item.title || `Pesan ${item.providerName || "tenaga kesehatan"}`}</button>)}</div>}
      <div className="border-b border-line py-3 text-sm font-bold">{activeConversation?.title || `Percakapan dengan ${activeConversation?.providerName || "tenaga kesehatan"}`}</div>
      <div className="flex-1 space-y-3 overflow-y-auto py-4" aria-live="polite">{messages.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-muted">Belum ada pesan. Bunda dapat membalas setelah tenaga kesehatan mengirim pesan.</p> : messages.map((message) => <div key={message._id} className={`max-w-[88%] rounded-2xl p-4 text-sm leading-6 ${message.senderRole === "PREGNANT_MOTHER" ? "ml-auto bg-brand text-white" : "bg-slate-50 text-slate-800"}`}><p className="mb-1 text-[10px] font-bold opacity-70">{message.senderRole === "PREGNANT_MOTHER" ? "Bunda" : "Tenaga kesehatan"}</p>{message.text}</div>)}</div>
      <form onSubmit={send} className="flex gap-2 border-t border-line pt-4"><input value={text} onChange={(event) => setText(event.target.value)} maxLength={4000} disabled={!activeId || busy} className="field" placeholder="Tulis balasan…" /><button disabled={!activeId || busy || !text.trim()} className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white disabled:opacity-50"><Send className="size-4" />{busy ? "Mengirim…" : "Kirim"}</button></form>
    </>}
    {error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
  </Card>;
}

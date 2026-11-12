"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { ChatAssistant } from "./chat-assistant";
import { PatientCareTeamChat } from "./patient-care-team-chat";

type ConsultationTab = "assistant" | "care-team";

export function PatientConsultation() {
  const [tab, setTab] = useState<ConsultationTab>("assistant");

  return <div className="mt-6 max-w-3xl">
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Jenis konsultasi">
      <button type="button" role="tab" aria-selected={tab === "assistant"} onClick={() => setTab("assistant")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${tab === "assistant" ? "bg-pink-500 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
        <Sparkles className="size-4" /> Chat AI
      </button>
      <button type="button" role="tab" aria-selected={tab === "care-team"} onClick={() => setTab("care-team")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${tab === "care-team" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
        <MessageCircle className="size-4" /> Pesan tenaga kesehatan
      </button>
    </div>
    {tab === "assistant" ? <ChatAssistant /> : <PatientCareTeamChat />}
  </div>;
}

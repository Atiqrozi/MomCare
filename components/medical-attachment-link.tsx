"use client";

import { useState } from "react";
import { browserApi } from "@/lib/browser-api";

export function MedicalAttachmentLink({ recordId, fileId, name, label }: { recordId: string; fileId: string; name: string; label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function open() {
    const preview = window.open("about:blank", "_blank");
    if (preview) preview.opener = null;
    setPending(true);
    setError("");
    try {
      const result = await browserApi<{ url: string }>("/pregnancy/medical-record-attachments/access", { method: "POST", body: JSON.stringify({ recordId, fileId }) });
      if (preview) preview.location.href = result.url;
      else window.location.href = result.url;
    } catch (cause) {
      preview?.close();
      setError(cause instanceof Error ? cause.message : "Lampiran tidak dapat dibuka.");
    } finally { setPending(false); }
  }
  return <span className="inline-flex flex-col">
    <button type="button" onClick={open} disabled={pending} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 disabled:opacity-50">{pending ? "Membuka..." : label}: {name}</button>
    {error && <span role="alert" className="mt-1 text-xs text-red-600">{error}</span>}
  </span>;
}

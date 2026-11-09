"use client";

import { useState } from "react";
import { Button, Card } from "./ui";
import { browserApi } from "@/lib/browser-api";

type PregnancyProfile = {
  lmpDate?: string;
  estimatedDueDate?: string;
  pregnancyStatus?: string;
};

export function PregnancyProfileForm({ initialProfile }: { initialProfile?: PregnancyProfile | null }) {
  const [lmpDate, setLmpDate] = useState(initialProfile?.lmpDate?.slice(0, 10) ?? "");
  const [estimatedDueDate, setEstimatedDueDate] = useState(initialProfile?.estimatedDueDate?.slice(0, 10) ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateLmpDate(value: string) {
    setLmpDate(value);
    if (!value) {
      setEstimatedDueDate("");
      return;
    }
    const [year, month, day] = value.split("-").map(Number);
    const dueDate = new Date(Date.UTC(year, month - 1, day + 280));
    setEstimatedDueDate(dueDate.toISOString().slice(0, 10));
  }

  async function save() {
    setMessage("");
    setError("");
    try {
      await browserApi("/pregnancy/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...(lmpDate ? { lmpDate } : {}),
          ...(estimatedDueDate ? { estimatedDueDate } : {}),
        }),
      });
      setMessage("Profil kehamilan berhasil disimpan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Profil belum dapat disimpan.");
    }
  }

  return <Card className="max-w-2xl"><h2 className="font-black">Personalisasi timeline</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">HPHT<input className="field mt-2" type="date" value={lmpDate} onChange={(event) => updateLmpDate(event.target.value)} /></label><label className="text-sm font-bold">Perkiraan persalinan (HPL)<input className="field mt-2" type="date" value={estimatedDueDate} onChange={(event) => setEstimatedDueDate(event.target.value)} /></label></div><p className="mt-4 text-sm text-muted">HPL otomatis diperkirakan 280 hari dari HPHT dan bisa disesuaikan. Tenaga kesehatan dapat mengonfirmasi perkiraan ini, misalnya berdasarkan pemeriksaan USG.</p>{message && <p className="mt-4 text-sm font-bold text-emerald-700" role="status">{message}</p>}{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}<Button className="mt-5" onClick={save}>Simpan profil</Button></Card>;
}

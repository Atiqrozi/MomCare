"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { browserApi } from "@/lib/browser-api";
import { clearActivePatient, setActivePatient } from "@/lib/active-patient";

type Measurements = { heightCm?: number; weightKg?: number; systolicMmHg?: number; diastolicMmHg?: number; pulseBpm?: number; lilaCm?: number; tfuCm?: number; fetalHeartRateBpm?: number; nutritionStatus?: string; tetanusStatus?: string; fetalPresentation?: string; fetalMovement?: string; edema?: string; conjunctiva?: string };
type RecordDetails = { attachments?: Attachment[]; ultrasound?: Record<string, string>; laboratory?: Record<string, string>; treatment?: Record<string, string>; deliveryRecommendation?: string; preeclampsiaAssessment?: string; consultationNote?: string; educationAdvice?: string; nextVisitDate?: string };
type LastRecord = { recordDate?: string; measurements?: Measurements; details?: RecordDetails };
type Patient = { userId: string; lmpDate?: string; nik?: string; bpjsNumber?: string; latestRiskAssessment?: { level?: string }; latestMedicalRecord?: LastRecord; patient?: { fullName?: string } };
type Section = "Pemeriksaan Umum" | "Pemeriksaan Fisik" | "USG" | "Laboratorium" | "Tindakan & Catatan" | "Edukasi & Anjuran";
type Attachment = { kind: "ultrasound" | "laboratory"; name: string; mimeType: string; url: string; fileId?: string };
const sections: Section[] = ["Pemeriksaan Umum", "Pemeriksaan Fisik", "USG", "Laboratorium", "Tindakan & Catatan", "Edukasi & Anjuran"];

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function gestationalDaysAt(lmpDate?: string, recordDate?: string) {
  if (!lmpDate || !recordDate) return null;
  const [lmpYear, lmpMonth, lmpDay] = lmpDate.slice(0, 10).split("-").map(Number);
  const [recordYear, recordMonth, recordDay] = recordDate.slice(0, 10).split("-").map(Number);
  if (![lmpYear, lmpMonth, lmpDay, recordYear, recordMonth, recordDay].every(Number.isFinite)) return null;
  const days = (Date.UTC(recordYear, recordMonth - 1, recordDay) - Date.UTC(lmpYear, lmpMonth - 1, lmpDay)) / 86_400_000;
  return days >= 0 ? days : null;
}

function gestationalWeekAt(lmpDate?: string, recordDate?: string) {
  const days = gestationalDaysAt(lmpDate, recordDate);
  return days === null ? "" : String(Math.floor(days / 7));
}

export function MedicalRecordForm({ patients, initialPatientId = "" }: { patients?: Patient[] | null; initialPatientId?: string }) {
  const router = useRouter();
  const availablePatients = Array.isArray(patients) ? patients : [];
  const startingPatient = availablePatients.find((patient) => patient.userId === initialPatientId) ?? availablePatients[0];
  const startingRecord = startingPatient?.latestMedicalRecord;
  const [section, setSection] = useState<Section>(sections[0]);
  const [selectedPatientId, setSelectedPatientId] = useState(() =>
    availablePatients.some((patient) => patient.userId === initialPatientId)
      ? initialPatientId
      : availablePatients[0]?.userId ?? "",
  );
  const [recordDate, setRecordDate] = useState(startingRecord?.recordDate?.slice(0, 10) ?? localDateString());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const printAfterSave = useRef(false);
  const [systolic, setSystolic] = useState(startingRecord?.measurements?.systolicMmHg?.toString() ?? "");
  const [diastolic, setDiastolic] = useState(startingRecord?.measurements?.diastolicMmHg?.toString() ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(startingRecord?.details?.attachments ?? []);
  const [warningSigns, setWarningSigns] = useState<string[]>([]);
  const selectedPatient = availablePatients.find((patient) => patient.userId === selectedPatientId);
  const [gestationalWeek, setGestationalWeek] = useState(() => gestationalWeekAt(startingPatient?.lmpDate, startingRecord?.recordDate?.slice(0, 10) ?? localDateString()));
  const gestationalDays = gestationalDaysAt(selectedPatient?.lmpDate, recordDate);
  const gestationalAge = gestationalDays === null ? "Usia kehamilan belum dicatat" : `${Math.floor(gestationalDays / 7)} minggu ${gestationalDays % 7} hari`;
  useEffect(() => {
    if (!selectedPatient) {
      clearActivePatient();
      return;
    }
    setActivePatient({
      id: selectedPatient.userId,
      name: selectedPatient.patient?.fullName ?? selectedPatient.userId,
      gestationalAge,
    });
  }, [selectedPatient, gestationalAge]);
  const riskLevel = selectedPatient?.latestRiskAssessment?.level;
  const riskLabel = riskLevel === "urgent" || riskLevel === "elevated" ? "Risiko Tinggi" : riskLevel === "follow_up" ? "Risiko Sedang" : riskLevel === "no_flag" ? "Risiko Rendah" : "Belum dinilai";
  const map = useMemo(() => systolic && diastolic ? ((Number(systolic) + 2 * Number(diastolic)) / 3).toFixed(1) : "—", [systolic, diastolic]);
  const number = (form: FormData, key: string) => { const value = String(form.get(key) ?? "").trim(); return value ? Number(value) : undefined; };
  function toggleWarning(value: string) { setWarningSigns((items) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value]); }
  function selectPatient(patientId: string) {
    setSelectedPatientId(patientId);
    const patient = availablePatients.find((item) => item.userId === patientId);
    const lastRecord = patient?.latestMedicalRecord;
    const date = lastRecord?.recordDate?.slice(0, 10) ?? localDateString();
    setRecordDate(date);
    setGestationalWeek(gestationalWeekAt(patient?.lmpDate, date));
    setSystolic(lastRecord?.measurements?.systolicMmHg?.toString() ?? "");
    setDiastolic(lastRecord?.measurements?.diastolicMmHg?.toString() ?? "");
    setAttachments(lastRecord?.details?.attachments ?? []);
    setWarningSigns([]);
  }
  function selectRecordDate(value: string) {
    setRecordDate(value);
    setGestationalWeek(gestationalWeekAt(selectedPatient?.lmpDate, value));
  }
  async function readAttachment(file: File | undefined, kind: Attachment["kind"]) {
    if (!file) return;
    if (!(file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf")) { setError("Lampiran hanya mendukung JPG, PNG, atau PDF."); return; }
    if (file.size > 1_000_000) { setError("Ukuran setiap lampiran maksimal 1 MB."); return; }
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Berkas gagal dibaca.")); reader.readAsDataURL(file); });
    try {
      setPending(true);
      const uploaded = await browserApi<Attachment>("/pregnancy/medical-record-attachments", { method: "POST", body: JSON.stringify({ kind, name: file.name, mimeType: file.type, dataUrl }) });
      setAttachments((current) => [...current.filter((item) => item.kind !== kind), uploaded]);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Berkas gagal diunggah."); }
    finally { setPending(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const patientId = String(form.get("patientId") ?? "");
    if (!availablePatients.some((patient) => patient.userId === patientId)) {
      setError(availablePatients.length ? "Pilih pasien yang terdaftar sebelum menyimpan rekam medis." : "Belum ada pasien yang dapat dipilih. Periksa cakupan pasien atau daftarkan pasien terlebih dahulu.");
      setPending(false);
      return;
    }
    const numericMeasurements = {
      weightKg: number(form, "weightKg"), heightCm: number(form, "heightCm"),
      systolicMmHg: number(form, "systolicMmHg"), diastolicMmHg: number(form, "diastolicMmHg"),
      pulseBpm: number(form, "pulseBpm"), lilaCm: number(form, "lilaCm"), tfuCm: number(form, "tfuCm"),
      fetalHeartRateBpm: number(form, "fetalHeartRateBpm"),
    };
    const treatment = { ironTablets: String(form.get("ironTablets") ?? ""), calcium: String(form.get("calcium") ?? ""), aspirin: String(form.get("aspirin") ?? ""), referral: String(form.get("referral") ?? "") };
    const details = {
      attachments,
      ultrasound: { bpdCm: form.get("bpdCm"), abdominalCircumferenceCm: form.get("abdominalCircumferenceCm"), femurLengthCm: form.get("femurLengthCm"), estimatedFetalWeightGrams: form.get("estimatedFetalWeightGrams"), amnioticFluidIndexCm: form.get("amnioticFluidIndexCm"), placenta: form.get("placenta"), note: form.get("ultrasoundNote") },
      laboratory: { hemoglobin: form.get("hemoglobin"), urineProtein: form.get("urineProtein"), urineReduction: form.get("urineReduction"), glucose: form.get("glucose"), tripleElimination: form.get("tripleElimination"), note: form.get("laboratoryNote") },
      treatment,
      deliveryRecommendation: form.get("deliveryRecommendation"), preeclampsiaAssessment: form.get("preeclampsiaAssessment"),
      consultationNote: form.get("consultationNote"), educationAdvice: form.get("educationAdvice"),
      ...(form.get("nextVisitDate") ? { nextVisitDate: new Date(`${form.get("nextVisitDate")}T12:00:00.000Z`).toISOString() } : {}),
    };
    const recordDate = new Date(`${form.get("recordDate")}T12:00:00.000Z`).toISOString();
    const summary = `Pemeriksaan ANC minggu ke-${form.get("gestationalWeek")}. ${String(form.get("consultationNote") ?? "")}`.slice(0, 2000);
    try {
      await browserApi("/pregnancy/medical-records", {
        method: "POST",
        body: JSON.stringify({ patientId, recordDate, recordType: form.get("recordType"), summary: summary.trim() || "Pemeriksaan ANC", measurements: { ...numericMeasurements, nutritionStatus: form.get("nutritionStatus"), tetanusStatus: form.get("tetanusStatus"), fetalPresentation: form.get("fetalPresentation"), fetalMovement: form.get("fetalMovement"), edema: form.get("edema"), conjunctiva: form.get("conjunctiva") }, details }),
      });
      if (printAfterSave.current) { printAfterSave.current = false; window.print(); }
      if (numericMeasurements.systolicMmHg && numericMeasurements.diastolicMmHg) {
        try {
          const proteinResult = String(form.get("urineProtein") ?? "-");
          const urineProteinPlus = proteinResult.includes("(+3)") || proteinResult === "+++" ? 3 : proteinResult.includes("(+2)") || proteinResult === "++" ? 2 : proteinResult.includes("(+1)") || proteinResult === "+" ? 1 : proteinResult === "++++" ? 4 : 0;
          await browserApi("/risk-assessments/evaluate", { method: "POST", body: JSON.stringify({ patientId, systolicMmHg: numericMeasurements.systolicMmHg, diastolicMmHg: numericMeasurements.diastolicMmHg, urineProteinPlus, warningSigns }) });
        } catch { setMessage("Rekam medis tersimpan. Skrining risiko belum tersimpan; buka menu Risiko & Preeklamsia untuk mencoba kembali."); }
      }
      if (!message) setMessage("Rekam medis ANC berhasil disimpan.");
      router.push(`/dashboard/pasien/${encodeURIComponent(patientId)}/grafik`);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Data gagal disimpan."); }
    finally { setPending(false); }
  }

  return <form onSubmit={submit} className="space-y-5">
    <header className="rounded-2xl border border-blue-200 bg-white px-5 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-pink-100 text-lg font-extrabold text-pink-600">{selectedPatient?.patient?.fullName?.slice(0, 1) ?? "P"}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-base font-extrabold text-slate-900">{selectedPatient?.patient?.fullName ?? "Pilih pasien ANC"}</h1><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">{riskLabel}</span></div><p className="mt-1 text-xs text-slate-500">{selectedPatient?.nik ? `NIK: ${selectedPatient.nik} · ` : ""}{selectedPatient?.bpjsNumber ? `No. JKN: ${selectedPatient.bpjsNumber} · ` : ""}{gestationalAge}{selectedPatient?.latestMedicalRecord?.measurements?.heightCm ? ` · TB: ${selectedPatient.latestMedicalRecord.measurements.heightCm} cm` : ""}</p></div></div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3"><label className="flex items-center gap-2 text-xs font-bold text-slate-500"><span className="hidden sm:inline">Pilih Pasien (Cek RM):</span><select name="patientId" required disabled={!availablePatients.length} value={selectedPatientId} onChange={(event) => selectPatient(event.target.value)} className="min-w-[240px] rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-100">{availablePatients.length ? availablePatients.map((item) => <option key={item.userId} value={item.userId}>{item.patient?.fullName ?? item.userId}</option>) : <option value="">Belum ada pasien dalam cakupan Anda</option>}</select></label><span className="hidden h-8 w-px bg-slate-200 md:block"/><nav className="flex items-center gap-1.5 text-xs font-bold"><Link href={selectedPatientId ? `/dashboard/pasien/${encodeURIComponent(selectedPatientId)}` : "/dashboard/pasien"} className="rounded-full bg-slate-100 px-3.5 py-2.5 text-slate-700 hover:bg-slate-200">Profil & RM</Link><span className="rounded-full bg-blue-600 px-3.5 py-2.5 text-white">Input ANC</span><Link href={selectedPatientId ? `/dashboard/pasien/${encodeURIComponent(selectedPatientId)}/grafik` : "/dashboard/pasien"} className="rounded-full bg-slate-100 px-3.5 py-2.5 text-slate-700 hover:bg-slate-200">Grafik KIA</Link></nav></div>
      </div>
    </header>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(250px,0.28fr)_minmax(0,1fr)]">
    <aside className="rounded-2xl border border-slate-200 bg-white p-3.5 lg:sticky lg:top-24">{sections.map((item) => <button type="button" key={item} onClick={() => setSection(item)} className={`mb-1.5 w-full rounded-xl px-4 py-3.5 text-left text-sm font-bold transition last:mb-0 ${section === item ? "border border-blue-200 bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>{item}</button>)}</aside>
    <div className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-[0_2px_8px_rgba(15,23,42,0.02)] sm:px-7 sm:py-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-4"><div><h2 className="text-xl font-extrabold tracking-tight text-slate-900">{section}</h2><p className="mt-1 text-sm text-slate-400">Pasien: <span className="font-semibold text-slate-500">{selectedPatient?.patient?.fullName ?? "Belum dipilih"}</span></p></div><div className="flex flex-wrap items-end gap-2.5"><label className="text-xs font-bold text-slate-500">Minggu Gestasi<input name="gestationalWeek" type="number" min="0" max="45" value={gestationalWeek} onChange={(event) => setGestationalWeek(event.target.value)} className="field mt-1 w-24 !bg-white text-center !font-bold" /><span className="mt-1 block max-w-40 text-[10px] font-normal">{!selectedPatient ? "Pilih pasien untuk menghitung otomatis." : selectedPatient.lmpDate ? "" : "HPHT pasien belum dicatat."}</span></label><label className="text-xs font-bold text-slate-500">Tanggal Pemeriksaan<input name="recordDate" type="date" required value={recordDate} onChange={(event) => selectRecordDate(event.target.value)} className="field mt-1 !bg-white !font-semibold" /></label></div></div>
      <input type="hidden" name="recordType" value="Kunjungan ANC" />
      <div key={selectedPatientId} className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{!availablePatients.length && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 sm:col-span-2">Belum ada pasien dalam cakupan Anda. Periksa penugasan pasien terlebih dahulu.</p>}<div className={section === "Pemeriksaan Umum" ? "contents" : "hidden"}>
        <Field name="weightKg" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.weightKg} label="Berat Badan Ibu Hamil (BB - kg)" type="number" step="0.1" /><Field name="heightCm" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.heightCm} label="Tinggi Badan (TB - cm)" type="number" />
        <label className="text-sm font-bold text-slate-700">Tekanan Darah Sistolik / Diastolik (mmHg)<div className="mt-2 flex items-center gap-2"><input name="systolicMmHg" type="number" min="40" max="300" value={systolic} onChange={(event) => setSystolic(event.target.value)} className="field !bg-white !px-4 !py-3 !font-semibold" placeholder="Sistolik (contoh: 110)" /><span className="text-slate-400">/</span><input name="diastolicMmHg" type="number" min="20" max="200" value={diastolic} onChange={(event) => setDiastolic(event.target.value)} className="field !bg-white !px-4 !py-3 !font-semibold" placeholder="Diastolik (contoh: 70)" /></div></label><div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${Number(map) >= 90 ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-800"}`}><span>Skor MAP Otomatis = (2 × Diastolik + Sistolik) / 3<br />{map} mmHg</span><span className="text-xs">{Number(map) >= 90 ? "⚠ MAP ≥ 90 (Waspada Preeklamsia / Rujuk)" : "✓ Normal (< 90)"}</span></div>
        <Field name="pulseBpm" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.pulseBpm} label="Frekuensi Nadi (x/menit)" type="number" /><Field name="lilaCm" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.lilaCm} label="Lingkar Lengan Atas (LILA - cm)" type="number" step="0.1" /><SelectField name="nutritionStatus" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.nutritionStatus} label="Status Gizi (berdasarkan LILA)" values={["Normal (LILA ≥ 23.5 cm)", "KEK - Kurang Energi Kronis (LILA < 23.5 cm)", "Gizi Lebih / Obesitas"]} /><SelectField name="tetanusStatus" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.tetanusStatus} label="Status Imunisasi Tetanus (TT)" values={["TT5 (Lengkap - Perlindungan 25 Tahun)", "TT4", "TT3", "TT2", "TT1"]} />
      </div><div className={section === "Pemeriksaan Fisik" ? "contents" : "hidden"}><Field name="tfuCm" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.tfuCm} label="Tinggi Rahim / Tinggi Fundus Uteri (TFU - cm)" type="number" step="0.1" /><Field name="fetalHeartRateBpm" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.fetalHeartRateBpm} label="Denyut Jantung Janin (DJJ - x/menit)" type="number" /><SelectField name="fetalPresentation" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.fetalPresentation} label="Presentasi / Letak Janin" values={["Belum dapat dinilai", "Kepala (Normal)", "Sungsang (Presentasi Bokong)", "Lintang (Oblique/Transverse)", "Ballottement (+) (Trimester 1/Awal 2)"]} /><SelectField name="fetalMovement" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.fetalMovement} label="Gerakan Janin" values={["Belum dirasakan", "++ (Aktif >10x / 12 jam)", "+ (Terasa Normal)", "- (Berkurang / Waspada Gawat Janin)"]} /><SelectField name="edema" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.edema} label="Pemeriksaan Edema (Bengkak Wajah/Tangan/Tungkai)" values={["Tidak ada edema", "Edema tungkai ringan (Fisiologis)", "Edema wajah & tangan (+) - Waspada Preeklamsia"]} /><SelectField name="conjunctiva" defaultValue={selectedPatient?.latestMedicalRecord?.measurements?.conjunctiva} label="Konjungtiva & Sklera" values={["Normal (Tidak Anemis)", "Anemis Pucat (+) - Cek Hb"]} /></div>
      <div className={section === "USG" ? "contents" : "hidden"}><Field name="bpdCm" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.bpdCm} label="BPD (Biparietal Diameter - cm)" /><Field name="abdominalCircumferenceCm" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.abdominalCircumferenceCm} label="AC (Abdominal Circumference - cm)" /><Field name="femurLengthCm" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.femurLengthCm} label="FL (Femur Length - cm)" /><Field name="estimatedFetalWeightGrams" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.estimatedFetalWeightGrams} label="Taksiran Berat Janin (EFW - gram)" /><Field name="amnioticFluidIndexCm" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.amnioticFluidIndexCm} label="Indeks Cairan Ketuban (AFI - cm)" /><Field name="placenta" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.placenta} label="Insersi / Letak Plasenta" /><TextArea name="ultrasoundNote" defaultValue={selectedPatient?.latestMedicalRecord?.details?.ultrasound?.note} label="Kesimpulan / Ekspertise Hasil USG" /><FileField label="Upload File Gambar Hasil USG (JPG/PNG/PDF)" onChange={(file) => readAttachment(file, "ultrasound")} selected={attachments.find((item) => item.kind === "ultrasound")?.name} /></div>
      <div className={section === "Laboratorium" ? "contents" : "hidden"}><Field name="hemoglobin" defaultValue={selectedPatient?.latestMedicalRecord?.details?.laboratory?.hemoglobin} label="Hemoglobin / Hb (g/dL)" /><SelectField name="urineProtein" defaultValue={selectedPatient?.latestMedicalRecord?.details?.laboratory?.urineProtein} label="Urin Protein (Skrining Preeklamsia)" values={["Negatif (-)", "Positif (+1)", "Positif (+2) - Waspada Preeklamsia", "Positif (+3) - Waspada Preeklamsia Berat"]} /><SelectField name="urineReduction" defaultValue={selectedPatient?.latestMedicalRecord?.details?.laboratory?.urineReduction} label="Urin Reduksi (Glukosa Urin)" values={["Negatif (-)", "Positif (+1)", "Positif (+2)", "Positif (+3)"]} /><Field name="glucose" defaultValue={selectedPatient?.latestMedicalRecord?.details?.laboratory?.glucose} label="Gula Darah Sewaktu (GDS - mg/dL)" /><Field name="tripleElimination" defaultValue={selectedPatient?.latestMedicalRecord?.details?.laboratory?.tripleElimination} label="Skrining Triple Eliminasi (HBsAg, Sifilis, HIV)" /><TextArea name="laboratoryNote" defaultValue={selectedPatient?.latestMedicalRecord?.details?.laboratory?.note} label="Catatan Hasil Laboratorium" /><FileField label="Unggah File / Dokumen Hasil Laboratorium (JPG/PNG/PDF)" onChange={(file) => readAttachment(file, "laboratory")} selected={attachments.find((item) => item.kind === "laboratory")?.name} /></div>
      <div className={section === "Tindakan & Catatan" ? "contents" : "hidden"}><Field name="ironTablets" defaultValue={selectedPatient?.latestMedicalRecord?.details?.treatment?.ironTablets} label="Pemberian Tablet Tambah Darah (TTD)" /><SelectField name="calcium" defaultValue={selectedPatient?.latestMedicalRecord?.details?.treatment?.calcium} label="Pemberian Kalsium (anjuran 1.000–1.500 mg/hari)" values={["Diberikan (untuk membantu mencegah preeklamsia)", "Tidak diberikan", "Dilanjutkan"]} /><SelectField name="aspirin" defaultValue={selectedPatient?.latestMedicalRecord?.details?.treatment?.aspirin} label="Pemberian Aspirin Dosis Rendah (75–80 mg)" values={["Diberikan (bila ada indikasi risiko preeklamsia / MAP ≥ 90)", "Tidak diberikan", "Dilanjutkan"]} /><Field name="referral" defaultValue={selectedPatient?.latestMedicalRecord?.details?.treatment?.referral} label="Status Rujukan / Tindakan Lanjut" /><SelectField name="deliveryRecommendation" defaultValue={selectedPatient?.latestMedicalRecord?.details?.deliveryRecommendation} label="Rekomendasi Metode Persalinan (akan tampil di aplikasi pasien)" values={["Persalinan Normal (Pervaginam)", "Persalinan Normal (Pervaginam) dengan Pengawasan Tekanan Darah", "Direkomendasikan: Sectio Caesarea (SC) Terencana atas Indikasi Medis", "Direkomendasikan: Sectio Caesarea (SC) Segera - Indikasi Preeklamsia Berat / Eklamsia"]} /><TextArea name="preeclampsiaAssessment" defaultValue={selectedPatient?.latestMedicalRecord?.details?.preeclampsiaAssessment} label="Penilaian Risiko Preeklamsia / Eklamsia" /><TextArea name="consultationNote" defaultValue={selectedPatient?.latestMedicalRecord?.details?.consultationNote} label="Catatan Hasil Konsultasi & Evaluasi Jurnal Harian Pasien" /><fieldset className="sm:col-span-2"><legend className="text-sm font-bold">Tanda bahaya yang ditemukan saat pemeriksaan</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{[["severe_headache", "Sakit kepala berat"], ["visual_changes", "Gangguan penglihatan atau pandangan kabur"], ["upper_abdominal_pain", "Nyeri perut bagian atas"], ["shortness_of_breath", "Sesak napas"]].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={warningSigns.includes(value)} onChange={() => toggleWarning(value)} />{label}</label>)}</div></fieldset></div>
      <div className={section === "Edukasi & Anjuran" ? "contents" : "hidden"}><TextArea name="educationAdvice" defaultValue={selectedPatient?.latestMedicalRecord?.details?.educationAdvice} label="Anjuran Medis & Edukasi Tanda Bahaya Preeklamsia" /><label className="text-sm font-bold">Jadwal Kontrol ANC Berikutnya<input name="nextVisitDate" type="date" defaultValue={selectedPatient?.latestMedicalRecord?.details?.nextVisitDate?.slice(0, 10)} className="field mt-2" /></label></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:col-span-2"><div className="text-xs text-slate-500">Data tersimpan ke Rekam Medis & Grafik Evaluasi KIA. Lampiran disimpan di ImageKit.</div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSection(sections[Math.max(0, sections.indexOf(section) - 1)])} disabled={section === sections[0]} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold disabled:opacity-40">Sebelumnya</button><button type="button" onClick={() => setSection(sections[Math.min(sections.length - 1, sections.indexOf(section) + 1)])} disabled={section === sections[sections.length - 1]} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-40">Berikutnya</button><button type="button" disabled={pending || !availablePatients.length} onClick={() => { printAfterSave.current = true; document.getElementById("anc-submit")?.click(); }} className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-50">Simpan & Cetak</button><button id="anc-submit" disabled={pending || !availablePatients.length} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">{pending ? "Menyimpan..." : "Simpan ke Rekam Medis & Lihat Grafik KIA"}</button></div></div>
      {message && <p role="status" className="text-sm font-bold text-emerald-700 sm:col-span-2">{message}</p>}{error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      </div>
    </div>
    </div>
  </form>;
}

function Field({ name, label, type = "text", step, defaultValue }: { name: string; label: string; type?: string; step?: string; defaultValue?: string | number }) { return <label className="text-sm font-bold text-slate-700">{label}<input name={name} type={type} step={step} defaultValue={defaultValue} className="field mt-2 !rounded-2xl !border-slate-200 !bg-white !px-4 !py-3 text-[15px] font-semibold focus:!border-blue-300 focus:!ring-2 focus:!ring-blue-100" /></label>; }
function SelectField({ name, label, values, defaultValue }: { name: string; label: string; values: string[]; defaultValue?: string }) { return <label className="text-sm font-bold text-slate-700">{label}<select name={name} defaultValue={defaultValue ?? ""} className="field mt-2 !rounded-2xl !border-slate-200 !bg-white !px-4 !py-3 text-[15px] font-semibold focus:!border-blue-300 focus:!ring-2 focus:!ring-blue-100"><option value="">Belum dicatat</option>{values.map((value) => <option key={value}>{value}</option>)}</select></label>; }
function TextArea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) { return <label className="text-sm font-bold text-slate-700 sm:col-span-2">{label}<textarea name={name} defaultValue={defaultValue} maxLength={2000} rows={3} className="field mt-2 !min-h-24 !rounded-2xl !border-slate-200 !bg-white !px-4 !py-3 text-sm font-medium focus:!border-blue-300 focus:!ring-2 focus:!ring-blue-100" /></label>; }
function FileField({ label, selected, onChange }: { label: string; selected?: string; onChange: (file?: File) => void }) { return <label className="text-sm font-bold text-slate-700 sm:col-span-2">{label}<span className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 px-4 py-5 text-center text-sm font-bold text-blue-700 transition hover:bg-sky-50"><span className="mb-2 text-2xl">↑</span>{selected ? `Terunggah: ${selected}` : "Klik untuk memilih berkas"}<span className="mt-1 text-xs font-normal text-slate-400">JPG, PNG atau PDF · maksimal 1 MB</span><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => onChange(event.currentTarget.files?.[0])} className="sr-only" /></span></label>; }

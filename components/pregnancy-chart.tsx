"use client";

import { useMemo, useState } from "react";
import { Card } from "./ui";

type RecordItem = { _id: string; recordDate: string; recordType: string; measurements?: { weightKg?: number; heightCm?: number; systolicMmHg?: number; diastolicMmHg?: number; pulseBpm?: number; lilaCm?: number; tfuCm?: number; fetalHeartRateBpm?: number } };
type MetricKey = "weight" | "height" | "systolic" | "diastolic" | "pulse" | "lila" | "tfu" | "fetalHeartRate" | "map";
const metrics: Array<{ key: MetricKey; label: string; unit: string; color: string }> = [
  { key: "weight", label: "Berat badan", unit: "kg", color: "#ec4899" },
  { key: "height", label: "Tinggi badan", unit: "cm", color: "#8b5cf6" },
  { key: "systolic", label: "Tekanan sistolik", unit: "mmHg", color: "#2563eb" },
  { key: "diastolic", label: "Tekanan diastolik", unit: "mmHg", color: "#f97316" },
  { key: "pulse", label: "Frekuensi nadi", unit: "x/menit", color: "#14b8a6" },
  { key: "lila", label: "LILA", unit: "cm", color: "#06b6d4" },
  { key: "tfu", label: "TFU", unit: "cm", color: "#84cc16" },
  { key: "fetalHeartRate", label: "Denyut jantung janin", unit: "bpm", color: "#db2777" },
  { key: "map", label: "MAP", unit: "mmHg", color: "#7c3aed" },
];

export function PregnancyChart({ patientName, records }: { patientName: string; records: RecordItem[] }) {
  const [metricKey, setMetricKey] = useState<MetricKey>("weight");
  const metric = metrics.find((item) => item.key === metricKey)!;
  const ordered = useMemo(() => [...records].sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()), [records]);
  const series = ordered.map((record) => {
    const m = record.measurements;
    const value = metricKey === "weight" ? m?.weightKg : metricKey === "height" ? m?.heightCm : metricKey === "systolic" ? m?.systolicMmHg : metricKey === "diastolic" ? m?.diastolicMmHg : metricKey === "pulse" ? m?.pulseBpm : metricKey === "lila" ? m?.lilaCm : metricKey === "tfu" ? m?.tfuCm : metricKey === "fetalHeartRate" ? m?.fetalHeartRateBpm : m?.systolicMmHg != null && m.diastolicMmHg != null ? Number(((m.systolicMmHg + 2 * m.diastolicMmHg) / 3).toFixed(1)) : undefined;
    return { record, value };
  }).filter((item): item is { record: RecordItem; value: number } => typeof item.value === "number" && Number.isFinite(item.value));
  const values = series.map((item) => item.value);
  const baseLow = Math.min(...values, 0);
  const baseHigh = Math.max(...values, 1);
  const padding = baseHigh === baseLow ? 1 : (baseHigh - baseLow) * 0.12;
  const low = baseLow - padding;
  const high = baseHigh + padding;
  const points = series.map(({ value }, index) => {
    const x = series.length < 2 ? 400 : 30 + index * (740 / (series.length - 1));
    const y = 220 - ((value - low) / (high - low || 1)) * 190;
    return `${x},${y}`;
  }).join(" ");
  return <div className="space-y-5"><Card><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-black">Grafik Evaluasi Kehamilan · Buku KIA</h2><p className="mt-1 text-sm text-slate-500">{patientName} · hanya memakai pengukuran tersimpan.</p></div><label className="text-xs font-bold text-slate-500">Parameter<select value={metricKey} onChange={(event) => setMetricKey(event.target.value as MetricKey)} className="field mt-1 min-w-56">{metrics.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label></div>
    {series.length ? <><div className="mt-6 h-72 overflow-hidden rounded-xl border border-slate-100 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:100%_25%,12.5%_100%]"><svg viewBox="0 0 800 250" className="h-full w-full" role="img" aria-label={`${metric.label} pasien ${patientName}`}><polyline points={points} fill="none" stroke={metric.color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />{series.map((item, index) => { const x = series.length < 2 ? 400 : 30 + index * (740 / (series.length - 1)); const y = 220 - ((item.value - low) / (high - low || 1)) * 190; return <g key={item.record._id}><circle cx={x} cy={y} r="5" fill={metric.color} /><title>{item.value} {metric.unit}</title></g>; })}</svg></div><div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{series.length} catatan</span><span>{metric.label}: {series[series.length - 1].value} {metric.unit} · {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(series[series.length - 1].record.recordDate))}</span></div></> : <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center"><p className="font-bold text-slate-700">Belum ada pengukuran {metric.label.toLowerCase()}.</p><p className="mt-1 text-sm text-slate-500">Catat data ANC untuk menampilkan grafik KIA.</p></div>}</Card>
    <Card><h2 className="mb-3 font-black">Riwayat pengukuran</h2>{series.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Tanggal</th><th className="pb-3">Jenis pemeriksaan</th><th className="pb-3">{metric.label}</th></tr></thead><tbody className="divide-y divide-slate-100">{[...series].reverse().map(({ record, value }) => <tr key={record._id}><td className="py-3">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(record.recordDate))}</td><td className="py-3">{record.recordType}</td><td className="py-3 font-bold">{value} {metric.unit}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">Belum ada catatan klinis untuk parameter ini.</p>}</Card></div>;
}

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function BackendUnavailable({ detail = "API MomCare belum bisa dihubungi." }: { detail?: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
    <section className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-7 shadow-sm sm:p-9">
      <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700"><AlertTriangle className="size-6" /></span>
      <h1 className="mt-5 text-2xl font-black text-slate-900">Dashboard belum dapat dimuat</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail} Jalankan backend di folder <b>Backend</b> dengan perintah <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run start:dev</code>, lalu coba lagi.</p>
      <p className="mt-3 text-xs text-slate-500">Frontend saat ini mengarah ke <code className="rounded bg-slate-100 px-1.5 py-0.5">http://localhost:3000/api/v1</code>. Pastikan backend berjalan pada port tersebut dan MongoDB tersambung.</p>
      <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><RefreshCw className="size-4" />Coba lagi</Link>
    </section>
  </main>;
}

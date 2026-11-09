"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
    <section className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-bold text-rose-600">Layanan belum dapat dimuat</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">Tidak dapat terhubung ke server</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Pastikan backend MomCare aktif di port 3000 dan `API_BASE_URL` pada `Frontend/.env.local` mengarah ke `http://localhost:3000/api/v1`. Setelah server aktif, coba muat ulang halaman.</p>
      <button onClick={reset} className="mt-6 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white">Coba lagi</button>
    </section>
  </main>;
}

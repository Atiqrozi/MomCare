import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f9fc] px-5 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">404</p>
        <h1 className="mt-3 text-3xl font-black">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-muted">Halaman yang Anda cari tidak tersedia.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}

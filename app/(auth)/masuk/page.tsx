import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const demoMode = process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";
  return <main className="grid min-h-screen bg-white lg:grid-cols-2">
    <section className="relative hidden min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-[#fff5fa] via-[#fffaff] to-[#fff6fc] px-10 py-12 lg:flex">
      <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-pink-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 size-96 rounded-full bg-purple-100/40 blur-3xl" />
      <Link href="/" className="relative z-10 flex flex-col items-center text-center">
        <BrandLogo className="w-56 h-auto" />
      </Link>
      <div className="relative z-10 mt-14 flex w-full max-w-lg flex-1 items-center justify-center pb-8">
        <div className="w-full rounded-[2rem] border border-pink-100 bg-gradient-to-b from-pink-50/90 via-white/70 to-purple-50/70 px-7 pb-8 pt-8 text-center shadow-[0_16px_50px_rgba(236,72,153,0.08)] sm:px-10">
          <h1 className="mt-5 text-2xl font-extrabold leading-snug text-[#17243d]">Selamat Datang di<br /><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></h1>
          <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-500">Teman setia perjalanan kehamilan hingga 1000 Hari Pertama Kehidupan</p>
        </div>
      </div>
    </section>

    <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="MomCare beranda" className="lg:hidden"><BrandLogo className="w-36 h-auto" /></Link>
        <div className="mt-8 lg:mt-0">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Akun Anda</p>
          <h2 className="mt-2 text-3xl font-black">Masuk ke <span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></h2>
          <p className="mt-2 text-muted">Gunakan akun yang terdaftar untuk melanjutkan.</p>
          <div className="mt-8"><AuthForm mode="login" demoMode={demoMode} /></div>
          <p className="mt-6 text-center text-sm text-muted">Belum punya akun? <Link href="/daftar" className="font-bold text-brand">Daftar sekarang</Link></p>
        </div>
      </div>
    </section>
  </main>;
}


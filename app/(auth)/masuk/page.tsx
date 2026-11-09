import Link from "next/link";
import { AuthForm } from "@/components/forms";

export default function LoginPage() {
  const demoMode = process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";
  return <main className="grid min-h-screen bg-white lg:grid-cols-2">
    <section className="relative hidden min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-[#fff5fa] via-[#fffaff] to-[#fff6fc] px-10 py-12 lg:flex">
      <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-pink-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 size-96 rounded-full bg-purple-100/40 blur-3xl" />
      <Link href="/" className="relative z-10 flex flex-col items-center text-center">
        <MomCareLogo />
        <span className="mt-3 text-3xl font-black tracking-tight text-slate-900"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></span>
        <span className="mt-1 text-base tracking-wide text-slate-400">Maternal Journey Assistant</span>
      </Link>
      <div className="relative z-10 mt-14 flex w-full max-w-lg flex-1 items-center justify-center pb-8">
        <div className="w-full rounded-[2rem] border border-pink-100 bg-gradient-to-b from-pink-50/90 via-white/70 to-purple-50/70 px-7 pb-8 pt-8 text-center shadow-[0_16px_50px_rgba(236,72,153,0.08)] sm:px-10">
          <MotherIllustration />
          <h1 className="mt-5 text-2xl font-extrabold leading-snug text-[#17243d]">Selamat Datang di<br /><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></h1>
          <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-500">Teman setia perjalanan kehamilan hingga 1000 Hari Pertama Kehidupan</p>
        </div>
      </div>
    </section>

    <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <Link href="/" className="font-black lg:hidden"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></Link>
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

function MomCareLogo() {
  return <svg viewBox="0 0 100 100" role="img" aria-label="Logo MomCare" className="size-[58px] drop-shadow-sm">
    <defs><linearGradient id="moment-heart" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff5ca8" /><stop offset="65%" stopColor="#ed3c91" /><stop offset="100%" stopColor="#398bff" /></linearGradient></defs>
    <path d="M50 91C43 83 10 62 10 36 10 18 23 8 38 8c6 0 10 3 12 8 3-5 8-8 15-8 15 0 26 11 26 27 0 26-31 47-41 56Z" fill="url(#moment-heart)" />
    <circle cx="38" cy="37" r="10" fill="white" /><circle cx="62" cy="40" r="8" fill="white" />
    <path d="M20 65c0-10 8-17 18-17s18 7 18 17v6H20v-6Zm32 1c0-8 5-13 12-13s13 5 13 13v5H52v-5Z" fill="white" />
  </svg>;
}

function MotherIllustration() {
  return <svg viewBox="0 0 300 300" role="img" aria-label="Ilustrasi ibu hamil" className="mx-auto h-64 w-64 max-w-full">
    <circle cx="150" cy="152" r="120" fill="#f9e4f6" />
    <circle cx="64" cy="90" r="7" fill="#f8a9cc" /><circle cx="237" cy="91" r="7" fill="#f6a2d0" /><circle cx="62" cy="196" r="6" fill="#c5a4fa" />
    <path d="M75 245c7-24 7-61 8-96 1-43 10-81 58-88 49-8 74 25 73 74l-2 53c-1 18-17 31-36 31H92c-9 0-15 9-17 26Z" fill="#232132" />
    <path d="M117 74c0-24 15-41 37-41 25 0 42 17 42 42 0 21-13 37-36 40-25 3-43-17-43-41Z" fill="#ffd8c9" />
    <path d="M113 73c2-35 22-55 50-55 24 0 43 17 46 45-18-15-35-21-54-15-14 4-27 15-42 25Z" fill="#262233" />
    <path d="M160 115c-29 0-47 14-52 39l-15 91h102c29-25 42-58 31-90-9-25-30-40-66-40Z" fill="#ff4d98" />
    <path d="M145 118c-9 15-14 36-5 55 9 20 27 33 49 36 14 2 29-3 34-12 5-9-4-21-16-24-17-4-32 4-46-9-12-11-9-33-16-46Z" fill="#ff9abe" />
    <path d="M177 62c4 3 8 3 12 0m-28 20c4 4 9 5 14 2" fill="none" stroke="#51343c" strokeWidth="3" strokeLinecap="round" />
    <circle cx="174" cy="75" r="5" fill="#ff8d9f" />
    <path d="M148 145c-7 21 6 46 25 58 19 12 41 12 51 3 6-6 1-15-8-19-12-6-23 0-34-5-16-7-22-25-34-37Z" fill="#ffd9ce" />
    <path d="M162 177c7 9 18 13 29 12" fill="none" stroke="#fff5f2" strokeWidth="4" strokeLinecap="round" />
    <path d="M76 98c4-9 16-8 19 0 4-8 16-9 20 0 6 13-19 27-19 27S70 111 76 98Z" fill="#ff91bd" />
  </svg>;
}

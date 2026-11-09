import Link from "next/link";
import { NakesRegisterForm } from "@/components/nakes-register-form";

function MomCareBrandLogo({ size = "sm" }: { size?: "sm" | "lg" }) {
 const dim = size === "lg" ? "w-14 h-14" : "w-8 h-8";
 return (
  <div className="flex items-center gap-2.5 select-none">
   <div className={dim + " shrink-0"}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
     <defs><linearGradient id="nakesHeart" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF5CA8"/><stop offset="55%" stopColor="#FF3E8B"/><stop offset="100%" stopColor="#38B6FF"/></linearGradient></defs>
     <path d="M50 88 C50 88 12 64 12 36 C12 20 25 10 38 10 C45 10 50 15 50 15 C50 15 55 10 62 10 C75 10 88 20 88 36 C88 64 50 88 50 88 Z" fill="url(#nakesHeart)"/>
     <circle cx="39" cy="36" r="8.5" fill="#FFF"/>
     <circle cx="60" cy="44" r="6.5" fill="#FFF"/>
     <path d="M27 56 C27 47 35 45 43 47 C48 48 53 54 53 62 L32 62 C28 62 27 59 27 56 Z" fill="#FFF"/>
    </svg>
   </div>
   <div>
    <div className="font-extrabold tracking-tight text-slate-900 text-base leading-none"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></div>
    <div className="text-[9px] font-semibold text-slate-400 tracking-wide">Maternal Journey Assistant</div>
   </div>
  </div>
 );
}

function DoctorIllustration({ className = "w-48 h-48" }: { className?: string }) {
 return (
  <svg viewBox="0 0 220 220" className={className} fill="none">
   <circle cx="110" cy="115" r="85" fill="#FCE7F3" opacity="0.7"/>
   <circle cx="110" cy="115" r="68" fill="#E0F2FE" opacity="0.6"/>
   <path d="M75 60 C60 72 60 115 70 135 C82 150 138 150 146 125 C154 98 145 55 110 52 C92 50 82 54 75 60 Z" fill="#1E293B"/>
   <rect x="100" y="88" width="18" height="22" rx="7" fill="#FCD5C5"/>
   <circle cx="109" cy="74" r="20" fill="#FFE0D2"/>
   <path d="M101 72 Q104 75 107 72" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
   <path d="M113 72 Q116 75 119 72" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
   <path d="M105 82 Q110 86 115 82" stroke="#E11D48" strokeWidth="2" strokeLinecap="round"/>
   <path d="M89 68 C92 52 118 48 128 62 C131 66 129 74 129 74 C122 64 108 60 95 66 Z" fill="#1E293B"/>
   <path d="M66 205 L76 116 C78 106 92 102 110 102 C128 102 142 106 144 116 L154 205 Z" fill="#FFFFFF"/>
   <path d="M96 102 L110 142 L124 102 Z" fill="#F472B6"/>
   <path d="M90 106 C90 132 130 132 130 106" stroke="#475569" strokeWidth="3.5" strokeLinecap="round"/>
   <circle cx="126" cy="132" r="5" fill="#38BDF8" stroke="#475569" strokeWidth="2"/>
   <rect x="115" y="136" width="36" height="46" rx="5" fill="#0284C7" transform="rotate(-8 115 136)"/>
   <rect x="120" y="142" width="26" height="34" rx="2" fill="#E0F2FE" transform="rotate(-8 120 142)"/>
  </svg>
 );
}

export default function NakesRegisterPage() {
 return (
  <main className="flex-1 grid grid-cols-1 md:grid-cols-12 bg-gradient-to-br from-pink-50/70 via-white to-sky-50/80 min-h-screen">
   <div className="md:col-span-5 bg-gradient-to-b from-pink-50/80 via-purple-50/40 to-sky-50/60 p-8 flex flex-col items-center justify-center text-center border-r border-pink-100/80">
    <MomCareBrandLogo size="lg"/>
    <div className="mt-2 text-xs font-extrabold text-slate-700 bg-white/80 px-3 py-1 rounded-full border border-pink-100 shadow-2xs">Dashboard Tenaga Kesehatan</div>
    <DoctorIllustration className="w-52 h-52 my-4"/>
    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">Mendukung tenaga kesehatan memberikan pelayanan maternal, skrining preeklamsia, dan pemantauan Grafik Evaluasi Kehamilan secara terintegrasi.</p>
   </div>
   <div className="md:col-span-7 p-8 flex flex-col justify-center max-w-md mx-auto w-full space-y-5">
    <div>
     <h1 className="text-xl font-extrabold text-slate-900">Daftar Akun Tenaga Kesehatan</h1>
     <p className="text-xs text-slate-500 mt-1">Buat akun untuk mengakses dashboard nakes</p>
    </div>
    <NakesRegisterForm/>
    <p className="text-center text-xs text-slate-500">Sudah punya akun? <Link href="/masuk-nakes" className="font-bold text-blue-600 hover:underline">Masuk</Link></p>
    <p className="text-center text-xs text-slate-400">Ibu hamil? <Link href="/daftar" className="font-bold text-brand hover:underline">Daftar di sini</Link></p>
   </div>
  </main>
 );
}

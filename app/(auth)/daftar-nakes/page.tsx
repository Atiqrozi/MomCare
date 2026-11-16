import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { NakesRegisterForm } from "@/components/nakes-register-form";

export default function NakesRegisterPage() {
 return (
  <main className="flex-1 grid grid-cols-1 md:grid-cols-12 bg-gradient-to-br from-pink-50/70 via-white to-sky-50/80 min-h-screen">
   <div className="md:col-span-5 bg-gradient-to-b from-pink-50/80 via-purple-50/40 to-sky-50/60 p-8 flex flex-col items-center justify-center text-center border-r border-pink-100/80">
    <BrandLogo className="h-32 w-auto" />
    <div className="mt-2 text-xs font-extrabold text-slate-700 bg-white/80 px-3 py-1 rounded-full border border-pink-100 shadow-2xs">Dashboard Tenaga Kesehatan</div>
    
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

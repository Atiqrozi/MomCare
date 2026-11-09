import Link from "next/link";
import { RegistrationVerificationForm } from "@/components/registration-verification-form";

export default async function VerifyRegistrationPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-sm sm:p-8"><Link href="/" className="font-black"><span className="text-slate-900">Mom</span><span className="text-pink-500">Care</span></Link><h1 className="mt-6 text-2xl font-black">Verifikasi akun</h1><div className="mt-5"><RegistrationVerificationForm email={email ?? ""} /></div><p className="mt-6 text-center text-xs text-slate-500">Tidak menerima kode? Periksa alamat email atau pilih kirim ulang kode.</p></section></main>;
}

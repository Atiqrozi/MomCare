"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Stethoscope, UserCheck, Shield } from "lucide-react";
const roles=[{role:"Dokter",color:"bg-blue-50 border-blue-200 text-blue-700",ring:"ring-2 ring-blue-500 bg-blue-100/80",icon:Stethoscope},{role:"Bidan",color:"bg-pink-50 border-pink-200 text-pink-700",ring:"ring-2 ring-pink-500 bg-pink-100/80",icon:UserCheck},{role:"Admin",color:"bg-purple-50 border-purple-200 text-purple-700",ring:"ring-2 ring-purple-500 bg-purple-100/80",icon:Shield}];
export function NakesRegisterForm(){
 const router=useRouter();
 const [error,setError]=useState("");const [loading,setLoading]=useState(false);const [showPass,setShowPass]=useState(false);const [selectedRole,setSelectedRole]=useState("Dokter");
 async function submit(form:FormData){
  setLoading(true);setError("");
  const body={fullName:form.get("fullName"),nik:form.get("nik"),email:form.get("email"),phone:form.get("phone"),password:form.get("password"),role:selectedRole,facility:form.get("facility")||"RS KORPRI Pura Raharja",bloodType:form.get("bloodType"),consentGranted:form.get("consentGranted")==="on"?"true":"false"};
  try{const r=await fetch("/api/auth/register-nakes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const res=await r.json();if(!r.ok)throw new Error(res.message??"Registrasi gagal");router.push("/dashboard");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Terjadi kesalahan");}finally{setLoading(false);}
 }
 return(
  <form action={submit} className="space-y-3.5">
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Peran Akses (Role)</label><div className="grid grid-cols-3 gap-3">{roles.map(r=>{const I=r.icon;const sel=selectedRole===r.role;return(<button key={r.role} type="button" onClick={()=>setSelectedRole(r.role)} className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${r.color} ${sel?r.ring:"opacity-80 hover:opacity-100"}`}><I className="w-5 h-5"/><span className="text-xs font-extrabold">{r.role}</span></button>);})}</div></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">NIK *</label><input name="nik" type="text" required placeholder="16 Digit NIK" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"/></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap *</label><input name="fullName" type="text" required placeholder="Nama sesuai identitas" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"/></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Email *</label><input name="email" type="email" required placeholder="nama@email.com" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"/></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Nomor Telepon</label><input name="phone" type="tel" placeholder="08xxxxxxxxxx" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"/></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Kata Sandi *</label><div className="relative"><input name="password" type={showPass?"text":"password"} required minLength={8} placeholder="Minimal 8 karakter" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs pr-10 focus:outline-none focus:border-blue-500 focus:bg-white"/><button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Fasilitas Kesehatan</label><input name="facility" defaultValue="RS KORPRI Pura Raharja" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"/></div>
   <div><label className="text-xs font-bold text-slate-600 block mb-1">Golongan Darah</label><select name="bloodType" defaultValue="O+" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white">{["O+","A+","B+","AB+","O-","A-","B-","AB-"].map(b=><option key={b}>{b}</option>)}</select></div>
   <label className="flex items-start gap-3 text-xs text-slate-500"><input name="consentGranted" type="checkbox" required className="mt-1 accent-blue-600"/><span>Saya menyetujui penggunaan data untuk layanan MomCare dan bertanggung jawab atas akses sesuai peran.</span></label>
   {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
   <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-md shadow-blue-200 hover:opacity-95 transition disabled:opacity-50">{loading?"Memproses...":"Simpan Registrasi & Masuk"}</button>
  </form>
 );
}

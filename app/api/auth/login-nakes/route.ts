import { NextResponse } from "next/server";
import type { User } from "@/lib/types";

type LoginPayload = { data?: { accessToken?: string; user?: User }; accessToken?: string; user?: User; message?: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) return NextResponse.json({ message: "Email dan kata sandi wajib diisi." }, { status: 422 });
  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") {
    return NextResponse.json({ message: "Login tenaga kesehatan memerlukan backend aktif agar kredensial diverifikasi dan akun tersimpan." }, { status: 503 });
  }

  try {
    const backend = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000/api/v1"}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
    const payload = await backend.json().catch(() => ({})) as LoginPayload;
    if (!backend.ok) return NextResponse.json({ message: payload.message ?? "Email atau kata sandi tidak valid." }, { status: backend.status });

    const token = payload.data?.accessToken ?? payload.accessToken;
    const user = payload.data?.user ?? payload.user;
    if (!token || !user?.role || !user.id) return NextResponse.json({ message: "Respons autentikasi backend tidak lengkap; sesi tidak dibuat." }, { status: 502 });
    if (user.role === "PREGNANT_MOTHER") return NextResponse.json({ message: "Akun ini terdaftar sebagai ibu hamil. Silakan gunakan halaman masuk ibu." }, { status: 403 });
    const result = NextResponse.json({ success: true, data: user });
    result.cookies.set(process.env.AUTH_COOKIE_NAME ?? "moment_at", token, { httpOnly: true, sameSite: "lax", secure: process.env.AUTH_COOKIE_SECURE === "true", path: "/" });
    result.cookies.set(process.env.AUTH_ROLE_COOKIE_NAME ?? "moment_role", user.role, { httpOnly: true, sameSite: "lax", secure: process.env.AUTH_COOKIE_SECURE === "true", path: "/" });
    return result;
  } catch {
    return NextResponse.json({ message: "Backend tidak dapat dihubungi. Pastikan server API berjalan." }, { status: 502 });
  }
}

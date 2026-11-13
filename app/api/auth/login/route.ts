import { NextResponse } from "next/server";
import type { User } from "@/lib/types";
import { setSessionCookies } from "@/lib/auth-cookies";

type LoginPayload = { data?: { accessToken?: string; refreshToken?: string; user?: User }; accessToken?: string; refreshToken?: string; user?: User; message?: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "Email dan kata sandi wajib diisi." }, { status: 422 });
  }
  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") {
    return NextResponse.json({ message: "Login tidak tersedia dalam mode demo karena akun demo tidak disimpan. Hubungkan dan aktifkan backend untuk masuk dengan akun terdaftar." }, { status: 503 });
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000/api/v1"}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({})) as LoginPayload;
    if (!response.ok) return NextResponse.json({ message: payload.message ?? "Email atau kata sandi tidak valid." }, { status: response.status });

    const token = payload.data?.accessToken ?? payload.accessToken;
    const refreshToken = payload.data?.refreshToken ?? payload.refreshToken;
    const user = payload.data?.user ?? payload.user;
    if (!token || !refreshToken || !user?.role || !user.id) {
      return NextResponse.json({ message: "Respons autentikasi backend tidak lengkap; sesi tidak dibuat." }, { status: 502 });
    }
    const result = NextResponse.json({ success: true, data: user });
    return setSessionCookies(result, { accessToken: token, refreshToken, role: user.role });
  } catch {
    return NextResponse.json({ message: "Backend tidak dapat dihubungi. Pastikan server API berjalan." }, { status: 502 });
  }
}

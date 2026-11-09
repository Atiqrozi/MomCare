import { NextRequest, NextResponse } from "next/server";

const roleMap: Record<string, string> = {
  Dokter: "DOCTOR",
  Bidan: "MIDWIFE",
  Admin: "ADMIN",
  "Editor konten": "CONTENT_EDITOR",
  "Reviewer klinis": "CLINICAL_REVIEWER",
};

export async function POST(request: NextRequest) {
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME ?? "moment_at")?.value;
  if (!token) return NextResponse.json({ message: "Pembuatan akun nakes hanya dapat dilakukan oleh admin yang sudah masuk." }, { status: 401 });
  const body = await request.json();
  const role = roleMap[String(body.role ?? "")];
  if (!role || !body.fullName || !body.email || !body.password) {
    return NextResponse.json({ message: "Nama, email, kata sandi, dan peran staf yang valid wajib diisi." }, { status: 422 });
  }
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000/api/v1"}/users/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fullName: body.fullName, email: body.email, phone: body.phone || undefined, password: body.password, role, facilityId: body.facilityId || undefined }),
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Backend tidak dapat dihubungi." }, { status: 502 });
  }
}

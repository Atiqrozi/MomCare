import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Data registrasi tidak valid." }, { status: 422 });
  // Browser forms submit empty inputs as "". The backend's @IsOptional()
  // validators skip missing/null values, but still validate an empty string.
  // Omit blank optional fields so users can leave them unanswered.
  const optionalFields = ["phone", "education", "occupation", "bloodType", "medicalHistory", "lmpDate", "bpjsNumber"];
  for (const field of optionalFields) {
    if (body[field] === "") delete body[field];
  }
  if (!body.consentGranted || !body.fullName || !body.email || !body.password) return NextResponse.json({ message: "Nama, email, kata sandi, dan persetujuan wajib diisi." }, { status: 422 });
  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") {
    return NextResponse.json({ message: "Registrasi tidak tersedia dalam mode demo karena akun tidak disimpan. Aktifkan backend untuk membuat akun." }, { status: 503 });
  }
  const backend = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000/api/v1"}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }).catch(() => null);
  if (!backend) return NextResponse.json({ message: "Backend tidak dapat dihubungi. Pastikan server API berjalan." }, { status: 502 });
  if (!backend.ok) { const payload = await backend.json().catch(() => ({})); return NextResponse.json({ message: payload.message ?? "Registrasi gagal" }, { status: backend.status }); }
  const payload = await backend.json().catch(() => ({}));
  return NextResponse.json(payload, { status: backend.status });
}

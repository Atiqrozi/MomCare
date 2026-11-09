import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const allowedRoots = new Set([
  "auth", "pregnancy", "dashboard", "education", "hospital-services",
  "notifications", "users", "facilities",
  "chat", "risk-assessments",
]);

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path.length || !allowedRoots.has(path[0]) || path.some((part) => part === "." || part === ".." || part.includes("\\"))) {
    return NextResponse.json({ success: false, message: "Rute API tidak diizinkan" }, { status: 404 });
  }
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ success: false, message: "Origin tidak valid" }, { status: 403 });
    }
  }
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME ?? "moment_at")?.value;
  const target = `${process.env.API_BASE_URL ?? "http://localhost:3000/api/v1"}/${path.join("/")}${request.nextUrl.search}`;
  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") return NextResponse.json({ success: true, data: {} });
  const headers: HeadersInit = {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "x-request-id": request.headers.get("x-request-id") ?? randomUUID(),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
    cache: "no-store",
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "x-request-id": response.headers.get("x-request-id") ?? "",
    },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;

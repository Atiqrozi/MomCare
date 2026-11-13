import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { accessCookieName, clearSessionCookies, refreshCookieName, setSessionCookies } from "@/lib/auth-cookies";

const allowedRoots = new Set([
  "auth", "pregnancy", "dashboard", "education", "hospital-services",
  "notifications", "users", "facilities", "chat", "risk-assessments",
]);
const apiBase = () => (process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/+$/, "");

type RefreshPayload = { data?: { accessToken?: string; refreshToken?: string; user?: { role?: string } }; accessToken?: string; refreshToken?: string; user?: { role?: string } };

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

  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") return NextResponse.json({ success: true, data: {} });

  const accessName = accessCookieName();
  const refreshName = refreshCookieName();
  let accessToken = request.cookies.get(accessName)?.value;
  const refreshToken = request.cookies.get(refreshName)?.value;
  const target = `${apiBase()}/${path.join("/")}${request.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const headers = new Headers({
    "Content-Type": request.headers.get("content-type") ?? "application/json",
    "x-request-id": requestId,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });
  let upstream = await fetch(target, { method: request.method, headers, body, cache: "no-store" });
  let refreshed: { accessToken: string; refreshToken: string; role: string } | null = null;
  let clearCookies = false;

  if (upstream.status === 401 || upstream.status === 403) {
    console.warn("[session-monitor]", JSON.stringify({ event: "proxy_auth_error", path: path.join("/"), method: request.method, status: upstream.status, hasAccessCookie: Boolean(accessToken), hasRefreshCookie: Boolean(refreshToken), requestId, at: new Date().toISOString() }));
  }

  if (upstream.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${apiBase()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": requestId },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      const payload = await refreshResponse.json().catch(() => null) as RefreshPayload | null;
      const data = payload?.data ?? payload;
      const newAccessToken = data?.accessToken;
      const newRefreshToken = data?.refreshToken;
      const role = data?.user?.role;
      if (refreshResponse.ok && newAccessToken && newRefreshToken && role) {
        console.log("[session-monitor]", JSON.stringify({ event: "proxy_refresh_succeeded", path: path.join("/"), requestId, role, at: new Date().toISOString() }));
        accessToken = newAccessToken;
        refreshed = { accessToken, refreshToken: newRefreshToken, role };
        headers.set("Authorization", `Bearer ${accessToken}`);
        upstream = await fetch(target, { method: request.method, headers, body, cache: "no-store" });
      } else if (refreshResponse.status === 401 || refreshResponse.status === 403) {
        console.warn("[session-monitor]", JSON.stringify({ event: "proxy_refresh_rejected", path: path.join("/"), status: refreshResponse.status, requestId, at: new Date().toISOString() }));
        clearCookies = true;
      } else {
        console.error("[session-monitor]", JSON.stringify({ event: "proxy_refresh_failed", path: path.join("/"), status: refreshResponse.status, requestId, at: new Date().toISOString() }));
      }
    } catch (error) {
      console.error("[session-monitor]", JSON.stringify({ event: "proxy_refresh_network_error", path: path.join("/"), requestId, error: error instanceof Error ? error.message : "unknown", at: new Date().toISOString() }));
      // Return the original API response if refreshing is temporarily unavailable.
    }
  }

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "x-request-id": upstream.headers.get("x-request-id") ?? requestId,
    },
  });
  if (refreshed) setSessionCookies(response, refreshed);
  else if (clearCookies) clearSessionCookies(response);
  return response;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;

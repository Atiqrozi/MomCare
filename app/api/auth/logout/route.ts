import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies, refreshCookieName } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && origin !== request.nextUrl.origin) || fetchSite === "cross-site") {
    console.warn("[session-monitor]", JSON.stringify({ event: "logout_request_blocked", reason: "cross_site_request", originPresent: Boolean(origin), fetchSite, at: new Date().toISOString() }));
    return NextResponse.json({ success: false, message: "Permintaan logout tidak valid" }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  const refreshToken = request.cookies.get(refreshCookieName())?.value;
  const referer = request.headers.get("referer");
  let refererPath: string | null = null;
  try {
    refererPath = referer ? new URL(referer).pathname : null;
  } catch {
    refererPath = "invalid";
  }
  console.log("[session-monitor]", JSON.stringify({
    event: "logout_route_called",
    method: request.method,
    hasRefreshCookie: Boolean(refreshToken),
    refererPath,
    originPresent: Boolean(origin),
    fetchSite,
    fetchMode: request.headers.get("sec-fetch-mode"),
    fetchUser: request.headers.get("sec-fetch-user"),
    purpose: request.headers.get("purpose") ?? request.headers.get("sec-purpose"),
    at: new Date().toISOString(),
  }));
  if (refreshToken && process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true") {
    try {
      const backendResponse = await fetch(`${(process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/+$/, "")}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      console.log("[session-monitor]", JSON.stringify({ event: "backend_logout_response", status: backendResponse.status, at: new Date().toISOString() }));
    } catch (error) {
      console.error("[session-monitor]", JSON.stringify({ event: "backend_logout_network_error", error: error instanceof Error ? error.message : "unknown", at: new Date().toISOString() }));
      // The browser session is still cleared even if the backend is temporarily unavailable.
    }
  }
  return clearSessionCookies(response);
}

import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies, refreshCookieName } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  const refreshToken = request.cookies.get(refreshCookieName())?.value;
  console.log("[session-monitor]", JSON.stringify({ event: "logout_route_called", hasRefreshCookie: Boolean(refreshToken), at: new Date().toISOString() }));
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

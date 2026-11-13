import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies, refreshCookieName } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const refreshToken = request.cookies.get(refreshCookieName())?.value;
  if (refreshToken && process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true") {
    try {
      await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000/api/v1"}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // The browser session is still cleared even if the backend is temporarily unavailable.
    }
  }
  return clearSessionCookies(response);
}

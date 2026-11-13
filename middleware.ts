import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, clearSessionCookies, getJwtExpiry, refreshCookieName, roleCookieName, setSessionCookies } from "@/lib/auth-cookies";

type RefreshResult = { accessToken?: string; refreshToken?: string; user?: { role?: string }; data?: RefreshResult };

async function refreshSession(refreshToken: string) {
  try {
    const response = await fetch(`${(process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/+$/, "")}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null) as RefreshResult | null;
    const data = payload?.data ?? payload;
    if (!response.ok || !data?.accessToken || !data.refreshToken || !data.user?.role) {
      return { ok: false as const, unauthorized: response.status === 401 || response.status === 403 };
    }
    return { ok: true as const, accessToken: data.accessToken, refreshToken: data.refreshToken, role: data.user.role };
  } catch {
    return { ok: false as const, unauthorized: false };
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPathOrChild = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isStaffPath = isPathOrChild("/dashboard");
  const isPatientPath = ["/beranda", "/jadwal-anc", "/kehamilan", "/rekam-medis", "/vaksinasi", "/pengingat", "/konsultasi", "/hpk", "/profil", "/edukasi", "/layanan-rs"].some(isPathOrChild);
  const protectedPath = isStaffPath || isPatientPath;
  const accessName = accessCookieName();
  const refreshName = refreshCookieName();
  let accessToken = request.cookies.get(accessName)?.value;
  let refreshToken = request.cookies.get(refreshName)?.value;
  let role = request.cookies.get(roleCookieName())?.value;
  let refreshed: { accessToken: string; refreshToken: string; role: string } | null = null;

  if (protectedPath && refreshToken) {
    const expiry = accessToken ? getJwtExpiry(accessToken) : null;
    const remaining = expiry ? expiry - Math.floor(Date.now() / 1000) : null;
    if (!accessToken || (remaining !== null && remaining <= 5 * 60)) {
      const result = await refreshSession(refreshToken);
      if (result.ok) {
        accessToken = result.accessToken;
        refreshToken = result.refreshToken;
        role = result.role;
        refreshed = { accessToken, refreshToken, role };
        request.cookies.set(accessName, accessToken);
        request.cookies.set(refreshName, refreshToken);
        request.cookies.set(roleCookieName(), role);
      } else if (result.unauthorized || !accessToken || (remaining !== null && remaining <= 0)) {
        const redirect = NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
        return clearSessionCookies(redirect);
      }
    }
  }

  if (protectedPath && accessToken && getJwtExpiry(accessToken) !== null && getJwtExpiry(accessToken)! <= Math.floor(Date.now() / 1000)) {
    const redirect = NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
    return clearSessionCookies(redirect);
  }

  const hasSession = Boolean(accessToken?.trim());
  if (protectedPath && !hasSession) return NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
  if (hasSession && isStaffPath && role === "PREGNANT_MOTHER") return NextResponse.redirect(new URL("/beranda", request.url));
  if (hasSession && isPatientPath && role && role !== "PREGNANT_MOTHER") return NextResponse.redirect(new URL("/dashboard", request.url));

  const response = NextResponse.next({ request: { headers: request.headers } });
  if (refreshed) setSessionCookies(response, refreshed);
  return response;
}

export const config = {
  matcher: [
    "/beranda", "/beranda/:path*",
    "/jadwal-anc", "/jadwal-anc/:path*",
    "/kehamilan", "/kehamilan/:path*",
    "/rekam-medis", "/rekam-medis/:path*",
    "/vaksinasi", "/vaksinasi/:path*",
    "/pengingat", "/pengingat/:path*",
    "/konsultasi", "/konsultasi/:path*",
    "/hpk", "/hpk/:path*",
    "/profil", "/profil/:path*",
    "/edukasi", "/edukasi/:path*",
    "/layanan-rs", "/layanan-rs/:path*",
    "/dashboard", "/dashboard/:path*",
  ],
};

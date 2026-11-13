import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, clearSessionCookies, getJwtExpiry, refreshCookieName, roleCookieName, setSessionCookies } from "@/lib/auth-cookies";

type RefreshResult = { accessToken?: string; refreshToken?: string; user?: { role?: string }; data?: RefreshResult };

function sessionLog(event: string, details: Record<string, unknown>) {
  console.log("[session-monitor]", JSON.stringify({ event, at: new Date().toISOString(), ...details }));
}

async function refreshSession(refreshToken: string, pathname: string) {
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
      sessionLog("refresh_rejected", { pathname, status: response.status, hasAccessToken: Boolean(data?.accessToken), hasRefreshToken: Boolean(data?.refreshToken), hasRole: Boolean(data?.user?.role) });
      return { ok: false as const, unauthorized: response.status === 401 || response.status === 403 };
    }
    sessionLog("refresh_succeeded", { pathname, status: response.status, role: data.user.role });
    return { ok: true as const, accessToken: data.accessToken, refreshToken: data.refreshToken, role: data.user.role };
  } catch (error) {
    sessionLog("refresh_network_error", { pathname, error: error instanceof Error ? error.message : "unknown" });
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
  const expiry = accessToken ? getJwtExpiry(accessToken) : null;
  const remaining = expiry ? expiry - Math.floor(Date.now() / 1000) : null;

  if (protectedPath) {
    sessionLog("navigation", {
      pathname,
      role: role ?? null,
      hasAccessCookie: Boolean(accessToken),
      hasRefreshCookie: Boolean(refreshToken),
      accessExpirySecondsRemaining: remaining,
    });
  }

  if (protectedPath && refreshToken) {
    if (!accessToken || (remaining !== null && remaining <= 5 * 60)) {
      sessionLog("refresh_started", { pathname, reason: !accessToken ? "access_cookie_missing" : "access_token_near_expiry", accessExpirySecondsRemaining: remaining });
      const result = await refreshSession(refreshToken, pathname);
      if (result.ok) {
        accessToken = result.accessToken;
        refreshToken = result.refreshToken;
        role = result.role;
        refreshed = { accessToken, refreshToken, role };
        request.cookies.set(accessName, accessToken);
        request.cookies.set(refreshName, refreshToken);
        request.cookies.set(roleCookieName(), role);
      } else if (result.unauthorized || !accessToken || (remaining !== null && remaining <= 0)) {
        sessionLog("redirect_to_login", { pathname, reason: result.unauthorized ? "refresh_unauthorized" : !accessToken ? "missing_access_and_refresh_failed" : "access_expired_and_refresh_failed", destination: isStaffPath ? "/masuk-nakes" : "/masuk" });
        const redirect = NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
        return clearSessionCookies(redirect);
      }
    }
  }

  if (protectedPath && accessToken && getJwtExpiry(accessToken) !== null && getJwtExpiry(accessToken)! <= Math.floor(Date.now() / 1000)) {
    sessionLog("redirect_to_login", { pathname, reason: "access_expired", destination: isStaffPath ? "/masuk-nakes" : "/masuk" });
    const redirect = NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
    return clearSessionCookies(redirect);
  }

  const hasSession = Boolean(accessToken?.trim());
  if (protectedPath && !hasSession) {
    sessionLog("redirect_to_login", { pathname, reason: "access_cookie_missing", destination: isStaffPath ? "/masuk-nakes" : "/masuk" });
    return NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
  }
  if (hasSession && isStaffPath && role === "PREGNANT_MOTHER") {
    sessionLog("role_redirect", { pathname, role, destination: "/beranda" });
    return NextResponse.redirect(new URL("/beranda", request.url));
  }
  if (hasSession && isPatientPath && role && role !== "PREGNANT_MOTHER") {
    sessionLog("role_redirect", { pathname, role, destination: "/dashboard" });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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

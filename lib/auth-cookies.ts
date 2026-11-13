import { NextResponse } from "next/server";

export const accessCookieName = () => process.env.AUTH_COOKIE_NAME ?? "moment_at";
export const roleCookieName = () => process.env.AUTH_ROLE_COOKIE_NAME ?? "moment_role";
export const refreshCookieName = () => process.env.AUTH_REFRESH_COOKIE_NAME ?? "moment_rt";

function secureCookie() {
  return process.env.NODE_ENV === "production" || process.env.AUTH_COOKIE_SECURE === "true";
}

export function getJwtExpiry(token: string) {
  try {
    const payload = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payload) return null;
    const claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "="))) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

export function setSessionCookies(response: NextResponse, session: { accessToken: string; refreshToken: string; role: string }) {
  const expiry = getJwtExpiry(session.accessToken);
  const accessMaxAge = expiry ? Math.max(1, expiry - Math.floor(Date.now() / 1000)) : 60 * 60;
  const common = { httpOnly: true, sameSite: "lax" as const, secure: secureCookie(), path: "/" };
  response.cookies.set(accessCookieName(), session.accessToken, { ...common, maxAge: accessMaxAge });
  response.cookies.set(refreshCookieName(), session.refreshToken, { ...common, maxAge: 30 * 24 * 60 * 60 });
  response.cookies.set(roleCookieName(), session.role, { ...common, maxAge: 30 * 24 * 60 * 60 });
  return response;
}

export function clearSessionCookies(response: NextResponse) {
  const common = { httpOnly: true, sameSite: "lax" as const, secure: secureCookie(), path: "/", maxAge: 0 };
  response.cookies.set(accessCookieName(), "", common);
  response.cookies.set(refreshCookieName(), "", common);
  response.cookies.set(roleCookieName(), "", common);
  return response;
}

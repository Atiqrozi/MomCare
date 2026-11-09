import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get(process.env.AUTH_COOKIE_NAME ?? "moment_at")?.value;
  const hasSession = Boolean(sessionToken?.trim());
  const role = request.cookies.get(process.env.AUTH_ROLE_COOKIE_NAME ?? "moment_role")?.value;
  const isPathOrChild = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isStaffPath = isPathOrChild("/dashboard");
  const isPatientPath = ["/beranda", "/jadwal-anc", "/kehamilan", "/rekam-medis", "/vaksinasi", "/pengingat", "/konsultasi", "/hpk", "/profil", "/edukasi"].some(isPathOrChild);
  if ((isStaffPath || isPatientPath) && !hasSession) return NextResponse.redirect(new URL(isStaffPath ? "/masuk-nakes" : "/masuk", request.url));
  if (hasSession && isStaffPath && role === "PREGNANT_MOTHER") return NextResponse.redirect(new URL("/beranda", request.url));
  if (hasSession && isPatientPath && role && role !== "PREGNANT_MOTHER") return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
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
    "/dashboard", "/dashboard/:path*",
  ],
};

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/portal", "/admin"];
const adminPaths = ["/admin"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = routing.locales.find((l) => pathname.startsWith(`/${l}`)) || "en";
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const isProtected = protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathWithoutLocale.startsWith(p));

  if (isProtected) {
    const useSecureCookie =
      request.nextUrl.protocol === "https:" ||
      process.env.AUTH_URL?.startsWith("https://") === true;

    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: useSecureCookie,
    });

    if (!token) {
      const loginPath = isAdmin ? `/${locale}/login/admin` : `/${locale}/login`;
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    if (isAdmin && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/portal/dashboard`, request.url));
    }

    if (pathWithoutLocale.startsWith("/portal") && token.role === "ADMIN") {
      // Admins can access portal too if needed
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

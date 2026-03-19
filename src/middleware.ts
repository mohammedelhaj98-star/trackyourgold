import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/vaults", "/items", "/progress", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  const [, locale, section] = pathname.split("/");
  if (locale && protectedPaths.includes(`/${section ?? ""}`) && !request.cookies.get("tyg_access_token")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/:locale/dashboard/:path*",
    "/:locale/vaults/:path*",
    "/:locale/items/:path*",
    "/:locale/progress/:path*",
    "/:locale/settings/:path*"
  ]
};

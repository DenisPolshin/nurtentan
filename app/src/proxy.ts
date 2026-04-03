import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Initialize next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default auth(async (req) => {
  const { nextUrl } = req;

  // 1. Force redirect www to non-www
  if (nextUrl.hostname.startsWith("www.")) {
    const newUrl = new URL(req.url);
    newUrl.hostname = newUrl.hostname.replace("www.", "");
    return NextResponse.redirect(newUrl);
  }

  // 2. Handle API routes and static files - skip i18n
  if (
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.includes(".") // files like .png, .ico
  ) {
    return; // Let Next.js handle it normally
  }

  // 3. Let next-intl handle localization (redirects, rewriting)
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Gates every page except /login (and its check-email step) behind a
 * signed-in session — recipes are per-account data now, not a per-device
 * IndexedDB store anyone opening the app could already see. The MCP
 * server's own auth (personal access tokens, src/mcp/auth.ts) is separate
 * and unaffected by this — /api/mcp is excluded below.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginRoute = req.nextUrl.pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api/auth|api/mcp|_next/static|_next/image|favicon.ico|manifest.json|icon.*).*)"],
};

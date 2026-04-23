import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const runtime = "nodejs";

function dashboardForRole(role?: string | null) {
  switch (role) {
    case "SELLER":
      return "/seller/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPER_ADMIN":
      return "/super-admin";
    case "BUYER":
    default:
      return "/buyer/dashboard";
  }
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isBuyer = pathname.startsWith("/buyer");
  const isSeller = pathname.startsWith("/seller");
  const isAdmin = pathname.startsWith("/admin");
  const isSuperAdmin = pathname.startsWith("/super-admin");

  if (!isBuyer && !isSeller && !isAdmin && !isSuperAdmin) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const role = session.user.role ?? "BUYER";

  const unauthorizedUrl = new URL("/unauthorized", nextUrl);
  unauthorizedUrl.searchParams.set("attempted", pathname);
  unauthorizedUrl.searchParams.set("suggested", dashboardForRole(role));

  // Super Admin routes - only SUPER_ADMIN can access
  if (isSuperAdmin) {
    if (role === "SUPER_ADMIN") return NextResponse.next();
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Admin routes - ADMIN and SUPER_ADMIN can access
  if (isAdmin) {
    if (role === "ADMIN" || role === "SUPER_ADMIN") return NextResponse.next();
    return NextResponse.redirect(unauthorizedUrl);
  }

  if (isSeller) {
    if (role === "SELLER") return NextResponse.next();
    return NextResponse.redirect(unauthorizedUrl);
  }

  if (isBuyer) {
    if (role === "BUYER") return NextResponse.next();
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/buyer/:path*", "/seller/:path*", "/admin/:path*", "/super-admin/:path*"],
};


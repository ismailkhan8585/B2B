import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

function dashboardForRole(role?: string | null) {
  switch (role) {
    case "SELLER":
      return "/seller/dashboard";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/dashboard";
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

  if (!isBuyer && !isSeller && !isAdmin) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const role = session.user.role ?? "BUYER";

  if (isAdmin) {
    if (role === "ADMIN" || role === "SUPER_ADMIN") return NextResponse.next();
    return NextResponse.redirect(new URL(dashboardForRole(role), nextUrl));
  }

  if (isSeller) {
    if (role === "SELLER") return NextResponse.next();
    return NextResponse.redirect(new URL(dashboardForRole(role), nextUrl));
  }

  if (isBuyer) {
    if (role === "BUYER") return NextResponse.next();
    return NextResponse.redirect(new URL(dashboardForRole(role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/buyer/:path*", "/seller/:path*", "/admin/:path*"],
};


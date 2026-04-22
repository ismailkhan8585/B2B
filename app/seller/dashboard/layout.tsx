import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, TriangleAlert } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/dashboard/products", label: "Products" },
  { href: "/seller/dashboard/orders", label: "Orders" },
  { href: "/seller/dashboard/messages", label: "Messages" },
  { href: "/seller/dashboard/analytics", label: "Analytics" },
  { href: "/seller/dashboard/marketing", label: "Marketing" },
  { href: "/seller/dashboard/shipping", label: "Shipping" },
  { href: "/seller/dashboard/settings", label: "Settings" },
  { href: "/seller/dashboard/company", label: "Company" },
];

export default async function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const company = session.user.companyId
    ? await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { verificationStatus: true },
      })
    : null;

  const showCompleteProfile = !session.user.companyId || company?.verificationStatus !== "VERIFIED";

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Seller Portal
            </div>
            <div className="mt-4 space-y-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className={cn("block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          {showCompleteProfile ? (
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
              <TriangleAlert size={18} className="mt-0.5" style={{ color: "var(--warning)" }} />
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                  Complete your profile
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Add company details and submit documents to get verified and publish products.
                </div>
              </div>
              <Button asChild style={{ background: "var(--accent)" }} className="shrink-0">
                <Link href={session.user.companyId ? "/seller/dashboard/company" : "/seller/dashboard/company/setup"}>Open</Link>
              </Button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                {session.user.name ?? session.user.email}
              </div>
              <div className="truncate text-xs text-muted-foreground">{session.user.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" aria-label="Notifications">
                <Bell size={18} />
              </Button>
              <Button asChild style={{ background: "var(--accent)" }} className="hidden sm:inline-flex">
                <Link href="/seller/dashboard/products/new">+ New Product</Link>
              </Button>
            </div>
          </div>

          {children}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white md:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2 text-xs">
          {links.slice(0, 4).map((l) => (
            <Link key={l.href} href={l.href} className="px-2 py-2 text-muted-foreground">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}


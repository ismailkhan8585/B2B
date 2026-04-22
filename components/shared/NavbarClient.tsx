"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type NavbarCategory = { name: string; slug: string };

export function NavbarClient({
  categories,
  cartCount = 0,
}: {
  categories: NavbarCategory[];
  cartCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initialQ = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);

  const categoryOptions = useMemo(() => [{ name: "All Categories", slug: "all" }, ...categories], [categories]);

  const runSearch = () => {
    const sp = new URLSearchParams(searchParams.toString());
    if (q.trim()) sp.set("q", q.trim());
    else sp.delete("q");
    if (category !== "all") sp.set("category", category);
    else sp.delete("category");
    sp.delete("page");

    startTransition(() => {
      router.push(`/products?${sp.toString()}`);
      router.refresh();
    });
  };

  const activeCategorySlugFromPath = (() => {
    const match = pathname?.match(/^\/categories\/([^/]+)$/);
    return match?.[1] ?? null;
  })();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-7 w-7 place-items-center rounded-md text-xs font-semibold"
              style={{ background: "var(--accent)", color: "white" }}
              aria-hidden
            >
              B2
            </span>
            <span className="text-base font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
              TradeHub
            </span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center gap-4 md:flex" aria-label="Categories">
          {[
            "electronics",
            "machinery",
            "textiles",
            "chemicals",
            "agriculture",
            "construction",
            "automotive",
            "packaging",
          ].map((slug) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground",
                activeCategorySlugFromPath === slug && "text-foreground"
              )}
            >
              {slug.charAt(0).toUpperCase() + slug.slice(1)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-center md:flex-[1.3]">
          <div className="flex w-full max-w-[620px] items-stretch gap-2 rounded-md border border-input bg-background p-1">
            <label className="sr-only" htmlFor="global-category">
              Category
            </label>
            <select
              id="global-category"
              className="h-9 w-[170px] rounded-md bg-transparent px-3 text-sm text-foreground outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="All categories"
            >
              {categoryOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, suppliers, RFQs..."
                className="h-9 border-0 pl-9 shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch();
                }}
                aria-label="Search"
              />
            </div>

            <Button
              type="button"
              disabled={isPending}
              onClick={runSearch}
              className="h-9"
              style={{ background: "var(--primary)" }}
            >
              Search
            </Button>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="text-sm text-muted-foreground hover:text-foreground" type="button">
            EN
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground" type="button">
            USD
          </button>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/help">
            Help
          </Link>
          <Link className="relative" href="/cart" aria-label="Cart">
            <ShoppingCart className="text-foreground" size={18} />
            {cartCount ? (
              <span
                className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Button asChild variant="outline" className="h-9">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="h-9" style={{ background: "var(--accent)" }}>
            <Link href="/register">Join Free</Link>
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-white md:hidden">
          <div className="mx-auto max-w-[1280px] px-4 py-3">
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  "electronics",
                  "machinery",
                  "textiles",
                  "chemicals",
                  "agriculture",
                  "construction",
                  "automotive",
                  "packaging",
                ].map((slug) => (
                  <Link key={slug} href={`/categories/${slug}`} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link className="text-sm text-muted-foreground" href="/login">
                  Sign In
                </Link>
                <Link className="text-sm text-muted-foreground" href="/register">
                  Join Free
                </Link>
                <Link className="text-sm text-muted-foreground" href="/cart">
                  Cart
                </Link>
                <Link className="text-sm text-muted-foreground" href="/help">
                  Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}


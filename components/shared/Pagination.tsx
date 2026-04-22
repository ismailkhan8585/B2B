"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export function Pagination({
  total,
  page,
  pageSize,
  className,
}: {
  total: number;
  page: number;
  pageSize: number;
  className?: string;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  const buildHref = (p: number) => {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(p));
    return `${pathname}?${next.toString()}`;
  };

  const pages = (() => {
    if (pageCount <= 7) return range(1, pageCount);
    const start = Math.max(1, safePage - 2);
    const end = Math.min(pageCount, safePage + 2);
    const core = range(start, end);
    const set = new Set<number>([1, ...core, pageCount]);
    return Array.from(set).sort((a, b) => a - b);
  })();

  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className)}>
      <div className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total.toLocaleString()}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={safePage <= 1}>
          <Link href={buildHref(Math.max(1, safePage - 1))} aria-label="Previous page">
            Prev
          </Link>
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            asChild
            variant={p === safePage ? "default" : "outline"}
            size="sm"
            className={cn("min-w-9", p === safePage && "pointer-events-none")}
          >
            <Link href={buildHref(p)} aria-label={`Page ${p}`}>
              {p}
            </Link>
          </Button>
        ))}
        <Button asChild variant="outline" size="sm" disabled={safePage >= pageCount}>
          <Link href={buildHref(Math.min(pageCount, safePage + 1))} aria-label="Next page">
            Next
          </Link>
        </Button>
      </div>
    </div>
  );
}


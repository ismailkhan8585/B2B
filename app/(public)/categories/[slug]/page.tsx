import Link from "next/link";

import { getProducts } from "@/actions/product.actions";
import { ProductCard } from "@/components/shared/ProductCard";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { getActiveCategoriesTree } from "@/lib/public-data";

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);
  const sort =
    sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "top" || sp.sort === "new" ? (sp.sort as any) : "best";

  const [tree, result] = await Promise.all([getActiveCategoriesTree(), getProducts({ categorySlug: slug, page, pageSize: 24, sort })]);

  const categoryName = (() => {
    const stack = [...tree];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.slug === slug) return n.name;
      if (n.children?.length) stack.push(...n.children);
    }
    return slug;
  })();

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/categories" className="hover:text-foreground">
          Categories
        </Link>{" "}
        / <span className="text-foreground">{categoryName}</span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            {categoryName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{result.total.toLocaleString()} products</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/products?category=${encodeURIComponent(slug)}`}>Open in full filters</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              ...p,
              imageUrl: p.images[0]?.url ?? null,
            } as any}
          />
        ))}
      </div>

      <div className="mt-6">
        <Pagination total={result.total} page={result.page} pageSize={result.pageSize} />
      </div>
    </main>
  );
}


import Link from "next/link";

import { getActiveCategoriesTree, getCategoryCounts } from "@/lib/public-data";

export default async function CategoriesPage() {
  const [tree, counts] = await Promise.all([getActiveCategoriesTree(), getCategoryCounts()]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse the category tree from the database.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tree.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/categories/${c.slug}`} className="text-sm font-semibold hover:underline">
                  {c.name}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">
                  {(counts.get(c.id) ?? 0).toLocaleString()} products
                </div>
              </div>
              <Link href={`/products?category=${encodeURIComponent(c.slug)}`} className="text-xs text-muted-foreground hover:text-foreground">
                View products →
              </Link>
            </div>

            {c.children?.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {c.children.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/categories/${sc.slug}`}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:border-[color:var(--accent)]"
                  >
                    <div className="font-medium">{sc.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {(counts.get(sc.id) ?? 0).toLocaleString()} products
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted-foreground">No subcategories.</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}


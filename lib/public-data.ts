import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getActiveCategoriesTree = cache(async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, parentId: true, iconUrl: true },
  });

  const byParent = new Map<string | null, typeof categories>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }

  const build = (parentId: string | null): Array<(typeof categories)[number] & { children: any[] }> => {
    const children = byParent.get(parentId) ?? [];
    return children.map((c) => ({ ...c, children: build(c.id) }));
  };

  return build(null);
});

export const getCategoryCounts = cache(async () => {
  const rows = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { status: "ACTIVE", categoryId: { not: null } },
    _count: { _all: true },
  });
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.categoryId!, r._count._all);
  return map;
});


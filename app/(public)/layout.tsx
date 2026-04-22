import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { getActiveCategoriesTree } from "@/lib/public-data";

function flattenForNavbar(tree: Awaited<ReturnType<typeof getActiveCategoriesTree>>) {
  const out: { name: string; slug: string }[] = [];
  const walk = (nodes: typeof tree) => {
    for (const n of nodes) {
      out.push({ name: n.name, slug: n.slug });
      if (n.children?.length) walk(n.children);
    }
  };
  walk(tree);
  return out.slice(0, 50);
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categoriesTree = await getActiveCategoriesTree();
  const categories = flattenForNavbar(categoriesTree);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar categories={categories} />
      {children}
      <Footer />
    </div>
  );
}


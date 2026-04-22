"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createProduct } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const suggestedSlug = useMemo(() => slugify(name), [name]);
  const [slug, setSlug] = useState("");

  const canSubmit = useMemo(() => name.trim().length >= 2 && (slug || suggestedSlug).length >= 2, [name, slug, suggestedSlug]);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Add Product
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Create a draft product, then complete details and publish.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          startTransition(async () => {
            const res = await createProduct({ name, slug: slug || suggestedSlug, tags: [] });
            if (!res.success) {
              toast.error(res.error ?? "Create failed.");
              return;
            }
            toast.success("Draft created.");
            router.push(`/seller/dashboard/products/${res.data!.id}/edit`);
            router.refresh();
          });
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug("");
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={suggestedSlug} />
          <div className="text-xs text-muted-foreground">URL: /products/{slug || suggestedSlug || "your-product"}</div>
        </div>
        <Button type="submit" disabled={!canSubmit || isPending} style={{ background: "var(--accent)" }}>
          {isPending ? "Creating..." : "Create Draft"}
        </Button>
      </form>
    </div>
  );
}


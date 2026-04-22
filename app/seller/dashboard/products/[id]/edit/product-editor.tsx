"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteProduct, publishProduct, updateProduct, uploadProductImages } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SellerProductEditor({
  product,
  categories,
}: {
  product: any;
  categories: Array<{ id: string; name: string; parentId: string | null }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product.name ?? "");
  const [slug, setSlug] = useState(product.slug ?? "");
  const [shortDesc, setShortDesc] = useState(product.shortDesc ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [categoryId, setCategoryId] = useState<string>(product.categoryId ?? "");
  const [minOrderQty, setMinOrderQty] = useState<number>(product.minOrderQty ?? 1);
  const [minOrderUnit, setMinOrderUnit] = useState<string>(product.minOrderUnit ?? "");
  const [currency, setCurrency] = useState<string>(product.currency ?? "USD");
  const [pricingNote, setPricingNote] = useState<string>(product.pricingNote ?? "");
  const [tags, setTags] = useState<string>((product.tags ?? []).join(", "));

  const canSave = useMemo(() => name.trim().length >= 2 && slug.trim().length >= 2, [name, slug]);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Update details, upload images, and publish when verified.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await deleteProduct(product.id);
                if (!res.success) toast.error(res.error ?? "Delete failed.");
                else {
                  toast.success("Product deactivated.");
                  router.push("/seller/dashboard/products");
                  router.refresh();
                }
              });
            }}
          >
            Delete
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await publishProduct(product.id);
                if (!res.success) toast.error(res.error ?? "Publish failed.");
                else toast.success("Published.");
                router.refresh();
              });
            }}
            style={{ background: "var(--accent)" }}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="shortDesc">Short description</Label>
            <Input id="shortDesc" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Full description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="minOrderQty">Min order qty</Label>
              <Input id="minOrderQty" inputMode="numeric" value={minOrderQty} onChange={(e) => setMinOrderQty(Number(e.target.value || "1"))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minOrderUnit">Unit</Label>
              <Input id="minOrderUnit" value={minOrderUnit} onChange={(e) => setMinOrderUnit(e.target.value)} placeholder="pcs / kg / m" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pricingNote">Pricing note</Label>
            <Input id="pricingNote" value={pricingNote} onChange={(e) => setPricingNote(e.target.value)} placeholder="e.g. Price on request" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <Button
            type="button"
            disabled={!canSave || isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await updateProduct(product.id, {
                  name,
                  slug,
                  shortDesc: shortDesc || undefined,
                  description: description || undefined,
                  categoryId: categoryId || null,
                  minOrderQty,
                  minOrderUnit: minOrderUnit || undefined,
                  currency,
                  pricingNote: pricingNote || undefined,
                  tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                });
                if (!res.success) toast.error(res.error ?? "Save failed.");
                else toast.success("Saved.");
                router.refresh();
              });
            }}
            style={{ background: "var(--primary)" }}
          >
            Save Draft
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Images
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Upload multiple images (Cloudinary).</div>
          </div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (!files.length) return;
              startTransition(async () => {
                const res = await uploadProductImages(product.id, files as any);
                if (!res.success) toast.error(res.error ?? "Upload failed.");
                else toast.success("Uploaded.");
                router.refresh();
              });
            }}
          />

          {product.images?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((img: any) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.url} alt="" className="aspect-square w-full rounded-lg border border-border object-cover" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No images yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}


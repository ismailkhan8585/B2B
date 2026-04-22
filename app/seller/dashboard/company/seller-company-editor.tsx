"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateCompany, uploadCompanyDocument } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/shared/Badge";

export function SellerCompanyEditor({ company }: { company: any }) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(company.name ?? "");
  const [slug, setSlug] = useState(company.slug ?? "");
  const [description, setDescription] = useState(company.description ?? "");
  const [website, setWebsite] = useState(company.website ?? "");
  const [country, setCountry] = useState(company.country ?? "");
  const [city, setCity] = useState(company.city ?? "");
  const [businessType, setBusinessType] = useState(company.businessType ?? "");
  const [mainCategories, setMainCategories] = useState((company.mainCategories ?? []).join(", "));

  const canSave = useMemo(() => name.trim().length >= 2 && slug.trim().length >= 2, [name, slug]);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
            Company Profile
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            Verification: <Badge variant={company.verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING"}>{company.verificationStatus}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="businessType">Business type</Label>
              <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Manufacturer / Exporter" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="mainCategories">Main categories (comma separated)</Label>
            <Input id="mainCategories" value={mainCategories} onChange={(e) => setMainCategories(e.target.value)} />
          </div>

          <Button
            type="button"
            disabled={!canSave || isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await updateCompany(company.id, {
                  name,
                  slug,
                  description: description || undefined,
                  website: website || undefined,
                  country: country || undefined,
                  city: city || undefined,
                  businessType: businessType || undefined,
                  mainCategories: mainCategories
                    .split(",")
                    .map((c: string) => c.trim())
                    .filter(Boolean),
                });
                if (!res.success) toast.error(res.error ?? "Save failed.");
                else toast.success("Company updated.");
              });
            }}
            style={{ background: "var(--primary)" }}
          >
            Save
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Documents
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Upload license/certificates for verification.</div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="docType">Document type</Label>
            <Input id="docType" placeholder="business_license / tax_cert / iso_cert" />
          </div>
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              const type = (document.getElementById("docType") as HTMLInputElement | null)?.value ?? "";
              if (!file || !type) {
                toast.error("Choose a document type and file.");
                return;
              }
              startTransition(async () => {
                const res = await uploadCompanyDocument(company.id, file, type);
                if (!res.success) toast.error(res.error ?? "Upload failed.");
                else toast.success("Uploaded.");
              });
            }}
          />

          {company.documents?.length ? (
            <div className="space-y-2">
              {company.documents.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                  <div className="min-w-0 truncate text-sm">
                    {d.name} <span className="text-xs text-muted-foreground">({d.type})</span>
                  </div>
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                    View →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No documents uploaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}


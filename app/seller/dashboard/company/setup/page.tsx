"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCompany } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CompanySetupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const suggestedSlug = useMemo(() => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }, [name]);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Company Setup</CardTitle>
          <CardDescription>Complete your seller profile to list products.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug((current) => (current ? current : suggestedSlug));
              }}
              placeholder="Acme Manufacturing"
              autoComplete="organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Public slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={suggestedSlug || "acme-manufacturing"}
            />
            <p className="text-xs text-muted-foreground">Used in your public URL: /suppliers/{slug || "your-slug"}</p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await createCompany({ name, slug, mainCategories: [] });
                if (!res.success) {
                  setError(res.error ?? "Failed");
                  return;
                }
                router.push("/seller/dashboard");
                router.refresh();
              });
            }}
          >
            {isPending ? "Creating..." : "Create company"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}


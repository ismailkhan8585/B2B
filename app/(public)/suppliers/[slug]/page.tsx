import { notFound } from "next/navigation";

import { getCompanyBySlug } from "@/actions/company.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SupplierProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <CardDescription>
            {company.country ? `${company.country}${company.city ? `, ${company.city}` : ""}` : "Supplier profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {company.description ? <p className="text-sm text-muted-foreground">{company.description}</p> : null}
          <div className="text-sm">
            <div>
              <span className="text-muted-foreground">Verification:</span> {company.verificationStatus}
            </div>
            {company.website ? (
              <div>
                <span className="text-muted-foreground">Website:</span> {company.website}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_APP_NAME ?? "B2B Marketplace"}</p>
        <h1 className="text-3xl font-semibold tracking-tight">B2B Marketplace (Phase 1 Foundation)</h1>
        <p className="text-muted-foreground">
          Public browsing + role dashboards + auth + uploads are wired first. Feature modules come next.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Browse</CardTitle>
            <CardDescription>Public pages are accessible without signing in.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/products">Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/suppliers">Suppliers</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/categories">Categories</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>Register and verify email to access dashboards.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


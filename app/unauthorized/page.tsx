import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const attempted = typeof sp.attempted === "string" ? sp.attempted : null;
  const suggested = typeof sp.suggested === "string" ? sp.suggested : "/buyer/dashboard";

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <div className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
          Access Denied
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          You don’t have permission to access {attempted ? <span className="font-mono">{attempted}</span> : "that page"} with your current role.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild style={{ background: "var(--accent)" }}>
            <Link href={suggested}>Go to my dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}


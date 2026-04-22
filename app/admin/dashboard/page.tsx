import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/buyer/dashboard");

  const [usersCount, companiesCount, pendingCompanies, productsCount, recentUsers, pendingVerifications] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.company.count({ where: { verificationStatus: "PENDING" } }),
    prisma.product.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.company.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, createdAt: true, user: { select: { email: true } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Signed in as {session.user.email}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All roles</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{usersCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Companies</CardTitle>
            <CardDescription>Supplier profiles</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{companiesCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Companies</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{pendingCompanies}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
            <CardDescription>All statuses</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{productsCount}</CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest signups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4">
                <span className="truncate">{u.email}</span>
                <span className="text-muted-foreground">
                  {u.role} · {u.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Company Verifications</CardTitle>
            <CardDescription>Review in Phase 1 actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {pendingVerifications.length ? (
              pendingVerifications.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4">
                  <span className="truncate">{c.name}</span>
                  <span className="text-muted-foreground truncate">{c.user.email}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No pending verifications.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


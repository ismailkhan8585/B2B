"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!email && !!password, [email, password]);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Use your email + password (or email magic link if enabled).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!canSubmit || isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await signIn("credentials", { email, password, redirect: false });
                  if (!result || result.error) {
                    setError(result?.error ?? "Login failed");
                    return;
                  }
                  router.push(from || "/buyer/dashboard");
                  router.refresh();
                });
              }}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isPending || !email}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  await signIn("email", { email, callbackUrl: from || "/" });
                });
              }}
            >
              Email magic link
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


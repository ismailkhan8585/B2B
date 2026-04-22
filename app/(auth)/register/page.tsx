"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleChoice = "BUYER" | "SELLER";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [role, setRole] = useState<RoleChoice>("BUYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!name && !!email && password.length >= 8, [name, email, password]);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Choose a role, verify email, then access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              <Button type="button" variant={role === "BUYER" ? "default" : "outline"} onClick={() => setRole("BUYER")}>
                Buyer
              </Button>
              <Button type="button" variant={role === "SELLER" ? "default" : "outline"} onClick={() => setRole("SELLER")}>
                Seller
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            disabled={!canSubmit || isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await registerUser({ role, name, email, password });
                if (!res.success) {
                  setError(res.error ?? "Registration failed");
                  return;
                }

                try {
                  sessionStorage.setItem(`b2b:pw:${email.toLowerCase().trim()}`, password);
                } catch {}

                router.push(`/verify?email=${encodeURIComponent(email)}`);
              });
            }}
          >
            {isPending ? "Creating..." : "Create account"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}


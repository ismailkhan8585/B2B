"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { verifyEmail } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(() => code.trim().length >= 4, [code]);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Verify email</CardTitle>
          <CardDescription>Enter the OTP sent to {email || "your email"}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">OTP code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              placeholder="123456"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            disabled={!canSubmit || isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await verifyEmail(code);
                if (!res.success) {
                  setError(res.error ?? "Verification failed");
                  return;
                }

                // Auto sign-in using the password cached at register time (best-effort).
                const key = `b2b:pw:${email.toLowerCase().trim()}`;
                const cachedPw = (() => {
                  try {
                    return sessionStorage.getItem(key);
                  } catch {
                    return null;
                  }
                })();

                if (cachedPw && email) {
                  const result = await signIn("credentials", { email, password: cachedPw, redirect: false });
                  if (!result || result.error) {
                    router.push("/login");
                    return;
                  }
                } else {
                  router.push("/login");
                  return;
                }

                const role = res.data?.role ?? "BUYER";
                const destination =
                  role === "SELLER" ? "/seller/dashboard" : role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin/dashboard" : "/buyer/dashboard";

                router.push(destination);
                router.refresh();
              });
            }}
          >
            {isPending ? "Verifying..." : "Verify"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}


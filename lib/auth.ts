import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { emailFrom } from "@/lib/email";
import { authConfig } from "@/lib/auth.config";

type AppRole = "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
type AppUserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "BANNED";

function isActiveUser(status: AppUserStatus) {
  return status === "ACTIVE";
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: (() => {
    const providers = [
      Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            status: true,
          },
        });
        if (!user?.passwordHash) return null;
        if (!isActiveUser(user.status as AppUserStatus)) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status } as any;
      },
      }),
    ] as any[];

    if (process.env.RESEND_API_KEY) {
      providers.push(
        Resend({
          apiKey: process.env.RESEND_API_KEY,
          from: emailFrom,
        }),
      );
    }

    return providers;
  })(),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (authConfig.callbacks?.jwt) {
        token = await authConfig.callbacks.jwt({ token, user, account: null as any, profile: undefined, isNewUser: undefined, trigger: "signIn", session: undefined } as any) as any;
      }

      if (token?.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, status: true, company: { select: { id: true } } },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.companyId = dbUser.company?.id ?? null;
        }
      }

      return token;
    },
  },
});

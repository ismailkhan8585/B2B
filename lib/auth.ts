import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { resend, emailFrom } from "@/lib/email";

type AppRole = "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
type AppUserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "BANNED";

function isActiveUser(status: AppUserStatus) {
  return status === "ACTIVE";
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    newUser: "/register",
  },
  providers: [
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
    Email({
      from: emailFrom,
      async sendVerificationRequest({ identifier, url }) {
        if (!process.env.RESEND_API_KEY) {
          throw new Error("RESEND_API_KEY missing");
        }

        const { error } = await resend.emails.send({
          from: emailFrom,
          to: identifier,
          subject: "Sign in to B2B Marketplace",
          html: `
            <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6;">
              <p>Your sign-in link:</p>
              <p><a href="${url}">${url}</a></p>
              <p>If you didn't request this, you can ignore this email.</p>
            </div>
          `,
        });

        if (error) throw error;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, merge in role/status from `user` (Credentials)
      if (user) {
        token.role = (user as any).role ?? token.role;
        token.status = (user as any).status ?? token.status;
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
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      session.user.role = (token as any).role as AppRole | undefined;
      session.user.status = (token as any).status as AppUserStatus | undefined;
      session.user.companyId = ((token as any).companyId as string | null | undefined) ?? null;
      return session;
    },
  },
});


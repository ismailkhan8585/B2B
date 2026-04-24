import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    newUser: "/register",
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      session.user.role = (token as any).role as any;
      session.user.status = (token as any).status as any;
      session.user.companyId = ((token as any).companyId as any) ?? null;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? token.role;
        token.status = (user as any).status ?? token.status;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

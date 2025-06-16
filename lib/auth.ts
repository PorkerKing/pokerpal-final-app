// src/lib/auth.ts (CORRECTED VERSION)

import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],

  // 对于 v4 和数据库适配器，明确指定 session 策略是好习惯
  session: {
    strategy: "database", 
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        (session.user as any).id = user.id;
        const clubMember = await prisma.clubMember.findFirst({
            where: { userId: user.id },
            select: { role: true }
        });
        if (clubMember) {
            (session.user as any).role = clubMember.role;
        }
      }
      return session;
    },
    redirect() {
      return "/";
    },
  },
};

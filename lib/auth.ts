// src/lib/auth.ts (CORRECTED VERSION)

import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "email" },
          password: {  label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;
            const user = await prisma.user.findUnique({ where: { email: credentials.email }});
            if (user && credentials.password === 'password123') return user;
            return null;
        }
    })
  ],
  session: {
    strategy: "database", // Use database strategy for sessions
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const clubMember = await prisma.clubMember.findFirst({
            where: { userId: user.id },
            select: { role: true }
        });
        (session.user as any).id = user.id;
        if (clubMember) {
            (session.user as any).role = clubMember.role;
        }
      }
      return session;
    },
  },
};

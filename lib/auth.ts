// src/lib/auth.ts (CORRECTED VERSION)

import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

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
            // IMPORTANT: In a real app, you'd hash and compare passwords.
            // For this project, we use a plain text password for testing.
            if (user && credentials.password === 'password123') return user;
            return null;
        }
    })
  ],
  session: {
    strategy: "jwt", // The definitive strategy for this use case
  },
  callbacks: {
    // This callback is crucial for JWT strategy with custom properties
    async jwt({ token, user }) {
      if (user) { // user object is only available on first sign in
        const clubMember = await prisma.clubMember.findFirst({
            where: { userId: user.id },
            select: { role: true }
        });
        token.id = user.id;
        if (clubMember) {
            token.role = clubMember.role;
        }
      }
      return token;
    },
    // This callback makes the custom properties available in the client-side session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

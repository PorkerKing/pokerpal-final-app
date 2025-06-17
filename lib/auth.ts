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

            if (!user) {
                // We need a way to create a password for test users
                // This is NOT for production.
                const hashedPassword = await bcrypt.hash(credentials.password, 10);
                const newUser = await prisma.user.create({
                    data: {
                        email: credentials.email,
                        name: credentials.email.split('@')[0],
                        password: hashedPassword,
                    }
                });
                return newUser;
            }

            // For existing users, let's assume they all use 'password123' for now
            const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password || "" // Use empty string if password is null
            );

            if (!isPasswordValid) {
                // Fallback for our seed users that don't have a hashed password
                if(user.password === null && credentials.password === 'password123') return user;
                return null;
            }
            
            return user;
        }
    })
  ],
  session: {
    strategy: "jwt", // The definitive strategy for this use case
  },
  callbacks: {
    async signIn({ account }) {
      // This gatekeeper callback is the key to solving the conflict.
      // Allow OAuth to be handled by the adapter.
      if (account?.provider !== 'credentials') {
        return true;
      }
      // For credentials, we've already authorized, so we just allow the sign-in.
      // This prevents the adapter from trying to create a session for a credentials user.
      return true;
    },
    // This callback is crucial for JWT strategy with custom properties
    async jwt({ token, user }) {
      if (user) { // user object is only available on first sign in
        token.id = user.id;
        const clubMember = await prisma.clubMember.findFirst({
            where: { userId: user.id },
            select: { role: true }
        });
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

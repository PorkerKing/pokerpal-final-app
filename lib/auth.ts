// lib/auth-improved.ts - 安全改进版本

import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 扩展 NextAuth 类型定义
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 输入验证
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error("Invalid email format");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            // 避免暴露用户是否存在
            throw new Error("Invalid credentials");
          }
          
          // 必须有密码才能进行密码登录
          if (!user.password) {
            throw new Error("Password login not available for this account");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }
          
          // 返回用户信息
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          // 记录错误但不暴露详细信息
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session(params: any) {
      const { token, session } = params;
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt(params: any) {
      const { token, user, trigger, session } = params;
      // 首次登录时设置用户信息
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      
      // 支持会话更新（例如角色变更）
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      
      return token;
    },
  },
  events: {
    // 记录登录事件
    async signIn({ user, account }: any) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    // 记录登出事件
    async signOut({ token }: any) {
      console.log(`User ${token.email} signed out`);
    },
  },
  // 安全配置
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// 辅助函数：验证用户权限
export async function hasPermission(
  userId: string,
  clubId: string,
  requiredRoles: any[]
): Promise<boolean> {
  const membership = await prisma.clubMember.findFirst({
    where: {
      userId,
      clubId,
      role: { in: requiredRoles },
    },
  });
  
  return !!membership;
}

// 辅助函数：获取用户在特定俱乐部的角色
export async function getUserClubRole(
  userId: string,
  clubId: string
): Promise<string | null> {
  const membership = await prisma.clubMember.findFirst({
    where: { userId, clubId },
    select: { role: true },
  });
  
  return membership?.role || null;
}
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
          return null;
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            // 避免暴露用户是否存在
            return null;
          }
          
          // 必须有密码才能进行密码登录
          if (!user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
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
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // 支持的语言列表
      const supportedLocales = ['en', 'zh', 'zh-TW', 'ja'];
      
      // 处理错误重定向，确保包含语言前缀
      if (url.includes('/auth/error')) {
        // 从URL中提取语言代码或使用默认语言
        const locale = supportedLocales.find(loc => url.includes(`/${loc}/`)) || 'zh';
        return `${baseUrl}/${locale}/auth/error${url.includes('?') ? url.substring(url.indexOf('?')) : ''}`;
      }
      
      // 检测并修复重复的语言代码（适用于所有支持的语言）
      for (const locale of supportedLocales) {
        const duplicatePattern = `/${locale}/${locale}`;
        if (url.includes(duplicatePattern)) {
          const fixedUrl = url.replace(duplicatePattern, `/${locale}`);
          // 在开发环境记录修复日志
          if (process.env.NODE_ENV === 'development') {
            console.log(`Fixed duplicate locale in URL: ${url} -> ${fixedUrl}`);
          }
          return `${baseUrl}${fixedUrl}`;
        }
      }
      
      // 处理登录成功后的重定向
      if (url.startsWith("/")) {
        // 检查是否为根语言路径，如果是则重定向到dashboard
        const isRootLocalePath = supportedLocales.some(locale => url === `/${locale}`);
        if (isRootLocalePath) {
          return `${baseUrl}${url}/dashboard`;
        }
        
        // 确保URL包含有效的语言前缀
        const hasValidLocalePrefix = supportedLocales.some(locale => url.startsWith(`/${locale}/`));
        if (!hasValidLocalePrefix && url !== '/') {
          // 如果没有语言前缀，添加默认语言前缀
          return `${baseUrl}/zh${url}`;
        }
        
        return `${baseUrl}${url}`;
      }
      
      // 外部URL检查
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch (error) {
        console.warn('Invalid URL in redirect:', url);
      }
      
      // 默认重定向到中文dashboard
      return `${baseUrl}/zh/dashboard`;
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
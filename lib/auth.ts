// src/lib/auth.ts (CORRECTED VERSION)

import { db } from "@/lib/db"; // 确保从你的 db.ts 导入
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // <-- 正确的 v4 适配器
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  // 使用 @next-auth/prisma-adapter
  adapter: PrismaAdapter(db),
  
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // 我暂时移除了 EmailProvider，因为它在你的原始配置中不存在，
    // 我们可以先确保核心功能部署成功，再逐步添加。
  ],

  // 对于 v4 和数据库适配器，明确指定 session 策略是好习惯
  session: {
    strategy: "database", 
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    // 这个回调对于在 session 中获取 user.id 至关重要
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect() {
      return "/";
    },
  },
};

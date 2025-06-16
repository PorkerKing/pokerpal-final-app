import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GithubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  // 使用Prisma适配器，将session存储在数据库中
  adapter: PrismaAdapter(prisma),

  // 不再强制指定JWT策略，让NextAuth自动使用与Adapter匹配的"database"策略
  // session: { strategy: "jwt" }, // <-- 删除或注释掉这一行

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // 使用"database"策略时，session回调的参数是 session 和 user
    async session({ session, user }) {
      if (session?.user) {
        // 将数据库中用户的真实ID附加到session对象上
        session.user.id = user.id;

        // 同样可以附加角色信息
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
  },
};

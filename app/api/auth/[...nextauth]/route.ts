import NextAuth, { type AuthOptions } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Email from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

// 我们将authOptions定义在这里，但不在文件末尾导出它
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 提供者一：GitHub OAuth登录
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // 提供者二：邮件登录 (我们把它加回来！)
    Email({
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
    async session({ session, user }) {
      if (session?.user) {
        // 这是Cursor正确修正的部分，我们将它保留和优化
        const sessionUser = session.user as { id: string; role?: string };
        sessionUser.id = user.id;
        
        const clubMember = await prisma.clubMember.findFirst({
            where: { userId: user.id },
            select: { role: true }
        });
        if (clubMember) {
            sessionUser.role = clubMember.role;
        }
      }
      return session;
    },
  },
};

// 这是NextAuth v5推荐的、唯一需要导出的处理函数
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
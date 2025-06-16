import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // <-- 从我们新建的auth.ts文件中导入配置

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

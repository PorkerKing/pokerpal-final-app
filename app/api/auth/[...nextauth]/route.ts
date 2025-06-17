// app/api/auth/[...nextauth]/route.ts (最终修正版)

import NextAuth from "next-auth/next"; // <-- 使用 'next-auth/next'，这是最关键的修复
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

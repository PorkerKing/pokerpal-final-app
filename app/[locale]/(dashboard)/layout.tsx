import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';

export default async function DashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <div className="min-h-screen">
      {/* 主内容区域 - UnifiedSidebar已在根布局中渲染 */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* 顶部导航栏 */}
        <DashboardHeader />
        
        {/* 页面内容 */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
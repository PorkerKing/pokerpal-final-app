import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SidebarNav from '@/components/SidebarNav';
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
    <div className="min-h-screen bg-gray-50">
      {/* 固定侧边栏 */}
      <SidebarNav />
      
      {/* 主内容区域 */}
      <div className="lg:pl-72">
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
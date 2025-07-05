import { notFound } from 'next/navigation';
import { locales } from '../../i18n';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: locale === 'zh' ? 'PokerPal AI助手 - 专业扑克俱乐部管理平台' : 'PokerPal AI Assistant - Professional Poker Club Management',
    description: locale === 'zh' 
      ? '专为现代扑克俱乐部设计的革命性SaaS管理平台，提供AI助手、锦标赛管理、会员系统等完整解决方案'
      : 'Revolutionary SaaS management platform designed for modern poker clubs, featuring AI assistant, tournament management, member systems and complete solutions',
    viewport: 'width=device-width, initial-scale=1',
  };
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  if (!locales.includes(locale)) notFound();
  
  const messages = await getMessages();

  return (
    <Providers locale={locale} messages={messages}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 ml-20">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
} 
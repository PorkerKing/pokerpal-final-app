import { notFound } from 'next/navigation';
import { locales } from '../../i18n';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import { getMessages } from 'next-intl/server';

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
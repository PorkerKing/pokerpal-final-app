"use client";
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation'; 
import { useTransition } from 'react';
import { Languages, ChevronsUpDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const t = useTranslations('Header');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="relative flex items-center">
      <Languages size={16} className="text-gray-400 absolute left-3 pointer-events-none" />
      <select
        defaultValue={locale}
        onChange={onSelectChange}
        disabled={isPending}
        aria-label={t('languageSwitcherLabel')}
        className="appearance-none bg-white/5 border border-white/10 rounded-md pl-10 pr-8 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
      >
        <option value="zh" className="bg-[#171A29]">简体中文</option>
        <option value="zh-TW" className="bg-[#171A29]">繁體中文</option>
        <option value="ja" className="bg-[#171A29]">日本語</option>
        <option value="en" className="bg-[#171A29]">English</option>
      </select>
      <ChevronsUpDown size={16} className="text-gray-400 absolute right-3 pointer-events-none" />
    </div>
  );
} 
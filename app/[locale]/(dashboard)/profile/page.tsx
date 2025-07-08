"use client";

import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function ProfilePage() {
  const locale = useLocale();
  
  // 重定向到新的侧边栏式dashboard
  redirect(`/${locale}/dashboard`);
}
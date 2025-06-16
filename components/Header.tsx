"use client";
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import ClubSwitcher from './ClubSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const { data: session, status } = useSession();
  const t = useTranslations('Header');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  if (!hasMounted) {
    return (
      <header className="absolute top-0 right-0 p-4 md:p-6 z-20">
        <div className="h-[40px] w-[250px] bg-white/5 rounded-lg animate-pulse"></div>
      </header>
    );
  }

  if (status === 'authenticated') {
    return (
      <header className="absolute top-0 right-0 p-4 md:p-6 z-20">
        <div className="flex items-center space-x-4">
          <ClubSwitcher />
          <LanguageSwitcher />
          <div className="flex items-center space-x-2">
            {session.user?.image && (
              <Image src={session.user.image} alt="User Avatar" width={40} height={40} className="rounded-full" />
            )}
            <button onClick={() => signOut()} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-500 transition-colors">
              {t('signOut')}
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="absolute top-0 right-0 p-4 md:p-6 z-20">
      <button 
        onClick={() => signIn()} 
        className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-500 transition-colors"
      >
        {t('signInOrSignUp')}
      </button>
    </header>
  );
}; 
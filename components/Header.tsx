"use client";
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
// import ClubSwitcher from './ClubSwitcher';
// import LanguageSwitcher from './LanguageSwitcher';
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
      <header className="fixed top-0 right-0 p-4 md:p-6 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2">
            {session.user?.image && (
              <Image 
                src={session.user.image} 
                alt="User Avatar" 
                width={32} 
                height={32} 
                className="rounded-full ring-2 ring-purple-400/30" 
              />
            )}
            <button 
              onClick={() => signOut()} 
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 right-0 p-3 md:p-6 z-30">
      <div className="flex items-center">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
          <button 
            onClick={() => signIn('credentials')} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-sm md:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span className="hidden sm:inline">{t('signInOrSignUp')}</span>
            <span className="sm:hidden">登录</span>
          </button>
        </div>
      </div>
    </header>
  );
}; 
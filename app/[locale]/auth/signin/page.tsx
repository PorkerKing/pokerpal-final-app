"use client";

import { useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Lock, User, ArrowLeft, Spade, Diamond } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from '@/navigation';

export default function SignInPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);


  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    
    // Client-side validation
    if (!email || !password) {
      setLoginError(t('emailPasswordRequired'));
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: `/${locale}`,
        redirect: false
      });
      
      if (result?.error) {
        console.error('Login error:', result.error);
        setLoginError(result.error === 'CredentialsSignin' ? t('invalidCredentials') : t('signInError'));
      } else if (result?.url) {
        router.push(`/${locale}`);
      }
    } catch (error) {
      console.error('Credentials login error:', error);
      setLoginError(t('signInError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <Spade className="absolute top-10 left-10 h-12 w-12 text-white/10 rotate-12" />
        <Diamond className="absolute top-20 right-20 h-16 w-16 text-red-500/10 -rotate-12" />
        <Spade className="absolute bottom-20 left-20 h-14 w-14 text-white/10 rotate-45" />
        <Diamond className="absolute bottom-10 right-10 h-10 w-10 text-red-500/10 -rotate-45" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* 返回按钮 */}
        <div className="flex items-center">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToHome')}
          </Link>
        </div>

        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Spade className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {t('welcomeBack')}
          </h2>
          <p className="mt-2 text-gray-400">
            {t('signInToContinue')}
          </p>
        </div>

        {/* 错误提示 */}
        {(error || loginError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm text-center">
              {(error === 'CredentialsSignin' || loginError === 'CredentialsSignin') 
                ? t('invalidCredentials') 
                : t('signInError')}
            </p>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6">
          {/* 邮箱密码登录 */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={t('enterEmail')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={t('enterPassword')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <User className="h-5 w-5" />
              {isLoading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {/* 底部链接 */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              {t('noAccount')}
              <Link href={`/${locale}/auth/signup`} className="text-purple-400 hover:text-purple-300 ml-1">
                {t('signUp')}
              </Link>
            </p>
            <p className="text-gray-500 text-xs">
              {t('agreementText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
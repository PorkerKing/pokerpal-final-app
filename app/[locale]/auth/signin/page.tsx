"use client";

import { useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Github, Mail, Lock, User, ArrowLeft, Spade, Diamond } from 'lucide-react';
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

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('github', { callbackUrl: `/${locale}` });
    } catch (error) {
      console.error('GitHub login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: `/${locale}`,
        redirect: false
      });
      
      if (result?.error) {
        console.error('Login error:', result.error);
      } else if (result?.url) {
        router.push('/');
      }
    } catch (error) {
      console.error('Credentials login error:', error);
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
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>

        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Spade className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            欢迎回到 PokerPal
          </h2>
          <p className="mt-2 text-gray-400">
            登录您的账户继续使用
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm text-center">
              {error === 'CredentialsSignin' ? '邮箱或密码错误' : '登录时发生错误，请重试'}
            </p>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6">
          {/* GitHub 登录 */}
          <button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Github className="h-5 w-5" />
            使用 GitHub 登录
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">或</span>
            </div>
          </div>

          {/* 邮箱密码登录 */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                邮箱地址
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
                  placeholder="输入您的邮箱"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                密码
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
                  placeholder="输入您的密码"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <User className="h-5 w-5" />
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 底部链接 */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              还没有账户？
              <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 ml-1">
                立即注册
              </Link>
            </p>
            <p className="text-gray-500 text-xs">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
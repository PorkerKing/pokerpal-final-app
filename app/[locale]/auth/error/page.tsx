"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import { PokerBackground } from '@/components/PokerBackground';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('AuthError');
  const locale = useLocale();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'Unknown');
  }, [searchParams]);

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: Record<string, Record<string, string>> = {
      'zh': {
        'Configuration': 'NextAuth配置错误',
        'AccessDenied': '访问被拒绝',
        'Verification': '验证失败',
        'Default': '登录时发生错误',
        'Email and password are required': '邮箱和密码为必填项',
        'OAuthSignin': 'OAuth登录错误',
        'OAuthCallback': 'OAuth回调错误',
        'OAuthCreateAccount': 'OAuth创建账户错误',
        'EmailCreateAccount': '邮箱创建账户错误',
        'Callback': '回调错误',
        'OAuthAccountNotLinked': 'OAuth账户未关联',
        'EmailSignin': '邮箱登录错误',
        'CredentialsSignin': '凭据登录失败',
        'SessionRequired': '需要登录会话'
      },
      'zh-TW': {
        'Configuration': 'NextAuth配置錯誤',
        'AccessDenied': '訪問被拒絕',
        'Verification': '驗證失敗',
        'Default': '登入時發生錯誤',
        'Email and password are required': '郵箱和密碼為必填項',
        'OAuthSignin': 'OAuth登入錯誤',
        'OAuthCallback': 'OAuth回調錯誤',
        'OAuthCreateAccount': 'OAuth創建帳戶錯誤',
        'EmailCreateAccount': '郵箱創建帳戶錯誤',
        'Callback': '回調錯誤',
        'OAuthAccountNotLinked': 'OAuth帳戶未關聯',
        'EmailSignin': '郵箱登入錯誤',
        'CredentialsSignin': '憑據登入失敗',
        'SessionRequired': '需要登入會話'
      },
      'en': {
        'Configuration': 'NextAuth configuration error',
        'AccessDenied': 'Access denied',
        'Verification': 'Verification failed',
        'Default': 'An error occurred during sign in',
        'Email and password are required': 'Email and password are required',
        'OAuthSignin': 'OAuth sign in error',
        'OAuthCallback': 'OAuth callback error',
        'OAuthCreateAccount': 'OAuth account creation error',
        'EmailCreateAccount': 'Email account creation error',
        'Callback': 'Callback error',
        'OAuthAccountNotLinked': 'OAuth account not linked',
        'EmailSignin': 'Email sign in error',
        'CredentialsSignin': 'Credentials sign in failed',
        'SessionRequired': 'Session required'
      },
      'ja': {
        'Configuration': 'NextAuth設定エラー',
        'AccessDenied': 'アクセスが拒否されました',
        'Verification': '認証に失敗しました',
        'Default': 'サインイン中にエラーが発生しました',
        'Email and password are required': 'メールアドレスとパスワードが必要です',
        'OAuthSignin': 'OAuthサインインエラー',
        'OAuthCallback': 'OAuthコールバックエラー',
        'OAuthCreateAccount': 'OAuthアカウント作成エラー',
        'EmailCreateAccount': 'メールアカウント作成エラー',
        'Callback': 'コールバックエラー',
        'OAuthAccountNotLinked': 'OAuthアカウントが関連付けられていません',
        'EmailSignin': 'メールサインインエラー',
        'CredentialsSignin': '認証情報のサインインに失敗しました',
        'SessionRequired': 'セッションが必要です'
      }
    };

    const messages = errorMessages[locale] || errorMessages['zh'];
    return messages[errorCode] || messages['Default'];
  };

  const getSuggestion = (errorCode: string) => {
    const suggestions: Record<string, Record<string, string>> = {
      'zh': {
        'Configuration': '请联系管理员检查服务器配置',
        'AccessDenied': '您可能没有访问权限，请联系管理员',
        'Verification': '请检查您的邮箱链接或重新发送验证邮件',
        'Default': '请稍后重试，或使用其他登录方式',
        'Email and password are required': '请确保输入完整的邮箱地址和密码',
        'OAuthSignin': '请尝试其他登录方式，或联系管理员',
        'OAuthCallback': '登录被中断，请重新尝试',
        'OAuthCreateAccount': '账户创建失败，请重新尝试或使用其他方式',
        'EmailCreateAccount': '邮箱注册失败，请检查邮箱格式',
        'Callback': '登录回调失败，请重新尝试',
        'OAuthAccountNotLinked': '请先使用相同邮箱注册账户',
        'EmailSignin': '请检查邮箱和密码是否正确',
        'CredentialsSignin': '用户名或密码错误，请重新输入',
        'SessionRequired': '请重新登录以继续使用'
      },
      'zh-TW': {
        'Configuration': '請聯絡管理員檢查伺服器配置',
        'AccessDenied': '您可能沒有訪問權限，請聯絡管理員',
        'Verification': '請檢查您的郵箱連結或重新發送驗證郵件',
        'Default': '請稍後重試，或使用其他登入方式',
        'Email and password are required': '請確保輸入完整的郵箱地址和密碼',
        'OAuthSignin': '請嘗試其他登入方式，或聯絡管理員',
        'OAuthCallback': '登入被中斷，請重新嘗試',
        'OAuthCreateAccount': '帳戶創建失敗，請重新嘗試或使用其他方式',
        'EmailCreateAccount': '郵箱註冊失敗，請檢查郵箱格式',
        'Callback': '登入回調失敗，請重新嘗試',
        'OAuthAccountNotLinked': '請先使用相同郵箱註冊帳戶',
        'EmailSignin': '請檢查郵箱和密碼是否正確',
        'CredentialsSignin': '用戶名或密碼錯誤，請重新輸入',
        'SessionRequired': '請重新登入以繼續使用'
      },
      'en': {
        'Configuration': 'Please contact administrator to check server configuration',
        'AccessDenied': 'You may not have access permission, please contact administrator',
        'Verification': 'Please check your email link or resend verification email',
        'Default': 'Please try again later, or use another sign in method',
        'Email and password are required': 'Please ensure you enter a complete email address and password',
        'OAuthSignin': 'Please try another sign in method, or contact administrator',
        'OAuthCallback': 'Sign in was interrupted, please try again',
        'OAuthCreateAccount': 'Account creation failed, please try again or use another method',
        'EmailCreateAccount': 'Email registration failed, please check email format',
        'Callback': 'Sign in callback failed, please try again',
        'OAuthAccountNotLinked': 'Please register an account with the same email first',
        'EmailSignin': 'Please check if email and password are correct',
        'CredentialsSignin': 'Username or password is incorrect, please re-enter',
        'SessionRequired': 'Please sign in again to continue'
      },
      'ja': {
        'Configuration': '管理者にサーバー設定の確認をお願いします',
        'AccessDenied': 'アクセス権限がない可能性があります。管理者にお問い合わせください',
        'Verification': 'メールのリンクを確認するか、認証メールを再送信してください',
        'Default': '後でもう一度お試しいただくか、他のサインイン方法をご利用ください',
        'Email and password are required': '完全なメールアドレスとパスワードを入力してください',
        'OAuthSignin': '他のサインイン方法をお試しいただくか、管理者にお問い合わせください',
        'OAuthCallback': 'サインインが中断されました。もう一度お試しください',
        'OAuthCreateAccount': 'アカウント作成に失敗しました。もう一度お試しいただくか、他の方法をご利用ください',
        'EmailCreateAccount': 'メール登録に失敗しました。メール形式を確認してください',
        'Callback': 'サインインコールバックに失敗しました。もう一度お試しください',
        'OAuthAccountNotLinked': '同じメールでアカウントを先に登録してください',
        'EmailSignin': 'メールとパスワードが正しいかご確認ください',
        'CredentialsSignin': 'ユーザー名またはパスワードが間違っています。再入力してください',
        'SessionRequired': '継続するには再度サインインしてください'
      }
    };

    const localeSuggestions = suggestions[locale] || suggestions['zh'];
    return localeSuggestions[errorCode] || localeSuggestions['Default'];
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0F18] text-white">
      {/* 动态扑克背景 */}
      <PokerBackground />
      
      <div className="relative z-10 max-w-md w-full mx-auto p-6">
        <div className="bg-black/60 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 text-center">
          {/* 错误图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* 错误标题 */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {locale === 'zh' ? '登录失败' : 
             locale === 'zh-TW' ? '登入失敗' :
             locale === 'ja' ? 'サインイン失敗' : 'Sign In Failed'}
          </h1>

          {/* 错误消息 */}
          <div className="mb-6">
            <p className="text-red-400 font-medium mb-2">
              {getErrorMessage(error)}
            </p>
            <p className="text-gray-400 text-sm">
              {getSuggestion(error)}
            </p>
          </div>

          {/* 错误代码 */}
          {error && (
            <div className="mb-6 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500">
                {locale === 'zh' ? '错误代码' :
                 locale === 'zh-TW' ? '錯誤代碼' :
                 locale === 'ja' ? 'エラーコード' : 'Error Code'}: {error}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/${locale}/auth/signin`)}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <LogIn size={18} />
              {locale === 'zh' ? '重新登录' :
               locale === 'zh-TW' ? '重新登入' :
               locale === 'ja' ? '再度サインイン' : 'Sign In Again'}
            </button>
            
            <button
              onClick={() => router.push(`/${locale}/`)}
              className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              {locale === 'zh' ? '返回首页' :
               locale === 'zh-TW' ? '返回首頁' :
               locale === 'ja' ? 'ホームへ戻る' : 'Back to Home'}
            </button>
          </div>
        </div>

        {/* 帮助信息 */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {locale === 'zh' ? '如果问题持续存在，请联系技术支持' :
             locale === 'zh-TW' ? '如果問題持續存在，請聯絡技術支援' :
             locale === 'ja' ? '問題が解決しない場合は、テクニカルサポートにお問い合わせください' : 
             'If the problem persists, please contact technical support'}
          </p>
        </div>
      </div>
    </div>
  );
}
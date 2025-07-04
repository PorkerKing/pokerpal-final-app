'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations('Error');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Locale error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
        <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {t('title')}
        </h2>
        
        <p className="text-gray-400 text-center mb-6">
          {t('description')}
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">{t('errorMessage')}：</p>
            <p className="text-sm text-gray-300 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <>
                <p className="text-xs text-gray-500 mb-1 mt-2">Digest:</p>
                <p className="text-sm text-gray-300 font-mono">{error.digest}</p>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            {t('retry')}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Home size={16} />
            {t('home')}
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function DashboardError({
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
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {t('dashboardTitle')}
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          {t('dashboardDescription')}
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">{t('errorMessage')}：</p>
            <p className="text-sm text-gray-700 font-mono break-all">
              {error.message}
            </p>
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
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            <LayoutDashboard size={16} />
            {t('dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
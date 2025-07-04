'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              系统错误
            </h1>
            
            <p className="text-gray-400 mb-8">
              很抱歉，系统遇到了严重错误。请刷新页面或稍后再试。
            </p>

            <button
              onClick={() => reset()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              重新加载应用
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
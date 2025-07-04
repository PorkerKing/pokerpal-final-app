'use client';

import { useEffect } from 'react';
import { errorLogger } from '@/lib/error-logger';

export function ErrorMonitor() {
  useEffect(() => {
    // Monitor for console errors in development
    if (process.env.NODE_ENV === 'development') {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Call original console.error
        originalConsoleError(...args);
        
        // Log to our error logger
        const error = args[0];
        if (error instanceof Error) {
          errorLogger.logError(error, { source: 'console.error' });
        } else {
          errorLogger.logError(new Error(String(error)), { 
            source: 'console.error',
            args: args.slice(1)
          });
        }
      };

      // Cleanup
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
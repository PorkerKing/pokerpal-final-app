import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, options: ErrorOptions = {}) => {
    const {
      showToast = true,
      fallbackMessage = '操作失败，请稍后重试',
      onError
    } = options;

    // Convert unknown error to Error object
    let errorObj: Error;
    if (error instanceof Error) {
      errorObj = error;
    } else if (typeof error === 'string') {
      errorObj = new Error(error);
    } else {
      errorObj = new Error(fallbackMessage);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', errorObj);
    }

    // Show toast notification
    if (showToast) {
      toast.error(errorObj.message || fallbackMessage);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(errorObj);
    }

    return errorObj;
  }, []);

  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: ErrorOptions = {}
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, options);
        throw error;
      }
    }) as T;
  }, [handleError]);

  return {
    handleError,
    wrapAsync
  };
}
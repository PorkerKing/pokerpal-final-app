interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalHandlers() {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        type: 'unhandled-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        {
          type: 'unhandled-promise-rejection',
          reason: event.reason,
        }
      );
    });
  }

  logError(error: Error | unknown, metadata?: Record<string, any>) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    const log: ErrorLog = {
      message: errorObj.message,
      stack: errorObj.stack,
      timestamp: new Date().toISOString(),
      metadata,
    };

    if (typeof window !== 'undefined') {
      log.url = window.location.href;
      log.userAgent = navigator.userAgent;
    }

    // Add to local logs
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error logged at ${log.timestamp}`);
      console.error('Message:', log.message);
      if (log.stack) console.error('Stack:', log.stack);
      if (log.metadata) console.table(log.metadata);
      console.groupEnd();
    }

    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(log);
    }
  }

  private async sendToErrorService(log: ErrorLog) {
    // Implement integration with error tracking service
    // e.g., Sentry, LogRocket, etc.
    try {
      // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(log) });
    } catch (error) {
      // Fail silently to avoid recursive errors
      console.error('Failed to send error to service:', error);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = ErrorLogger.getInstance();

// Helper function for easy error logging
export function logError(error: Error | unknown, metadata?: Record<string, any>) {
  errorLogger.logError(error, metadata);
}
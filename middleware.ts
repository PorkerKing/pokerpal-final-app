import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

const intlMiddleware = createIntlMiddleware({
  locales: locales,
  defaultLocale: 'zh',
});

export default function middleware(request: NextRequest) {
  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${request.method} ${request.nextUrl.pathname} - ID: ${requestId}`);
  }

  // Run the intl middleware
  const response = intlMiddleware(request);
  
  // Add request ID to response headers
  if (response) {
    response.headers.set('x-request-id', requestId);
  }

  return response || NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 
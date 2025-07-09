import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Only show in development or with a secret key
  const debugKey = process.env.DEBUG_KEY || 'debug-pokerpal-2024';
  const requestDebugKey = new URL(request.url).searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && requestDebugKey !== debugKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        configured: !!process.env.DATABASE_URL,
        pooler: process.env.DATABASE_URL?.includes('pooler.supabase.com') || false,
      },
      auth: {
        url: process.env.NEXTAUTH_URL || 'NOT SET',
        urlIsProduction: !process.env.NEXTAUTH_URL?.includes('localhost'),
        secretConfigured: !!process.env.NEXTAUTH_SECRET,
        githubConfigured: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
      },
      ai: {
        xai_configured: !!process.env.XAI_API_KEY,
        siliconflow_configured: !!process.env.SILICONFLOW_API_KEY,
      },
      vercel: {
        url: process.env.VERCEL_URL || 'NOT SET',
        region: process.env.VERCEL_REGION || 'NOT SET',
      }
    }
  });
}

export const dynamic = 'force-dynamic';
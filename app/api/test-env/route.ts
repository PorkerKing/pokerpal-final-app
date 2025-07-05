import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.SILICONFLOW_API_KEY,
    keyLength: process.env.SILICONFLOW_API_KEY?.length || 0,
    keyPrefix: process.env.SILICONFLOW_API_KEY?.substring(0, 10) || 'NOT_SET',
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  });
}

export const dynamic = 'force-dynamic';
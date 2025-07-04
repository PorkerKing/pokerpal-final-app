import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const headersList = headers();
  const requestId = headersList.get('x-request-id') || 'unknown';

  const diagnostics = {
    timestamp: new Date().toISOString(),
    requestId,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT_SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
    },
    database: {
      connected: false,
      error: null as string | null,
    },
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.database.connected = true;
  } catch (error) {
    diagnostics.database.connected = false;
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json(diagnostics, { 
    status: 200,
    headers: {
      'x-request-id': requestId,
    }
  });
}
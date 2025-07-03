import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}
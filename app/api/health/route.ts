import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  let databaseStatus = 'disconnected';
  let databaseError = null;
  
  try {
    // 测试数据库连接
    await prisma.$executeRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch (error) {
    console.log('Database not available - running in demo mode:', error instanceof Error ? error.message : 'Unknown error');
    databaseError = 'Demo mode - database not required for basic functionality';
  }
  
  return NextResponse.json({
    status: 'healthy',
    database: databaseStatus,
    databaseError,
    demoMode: databaseStatus === 'disconnected',
    features: {
      aiChat: 'available',
      guestMode: 'available', 
      saasDemo: 'available',
      authentication: databaseStatus === 'connected' ? 'available' : 'limited'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
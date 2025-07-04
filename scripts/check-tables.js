const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('Checking database tables...\n');
    
    // Check if User table exists
    const userCount = await prisma.user.count().catch(() => null);
    console.log('✓ User table:', userCount !== null ? `exists (${userCount} records)` : 'NOT FOUND');
    
    // Check if GameRoom table exists
    const roomCount = await prisma.gameRoom.count().catch(() => null);
    console.log('✓ GameRoom table:', roomCount !== null ? `exists (${roomCount} records)` : 'NOT FOUND');
    
    // Check if Account table exists
    const accountCount = await prisma.account.count().catch(() => null);
    console.log('✓ Account table:', accountCount !== null ? `exists (${accountCount} records)` : 'NOT FOUND');
    
    // Check if Session table exists
    const sessionCount = await prisma.session.count().catch(() => null);
    console.log('✓ Session table:', sessionCount !== null ? `exists (${sessionCount} records)` : 'NOT FOUND');
    
    // Check if GameHistory table exists
    const historyCount = await prisma.gameHistory.count().catch(() => null);
    console.log('✓ GameHistory table:', historyCount !== null ? `exists (${historyCount} records)` : 'NOT FOUND');
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
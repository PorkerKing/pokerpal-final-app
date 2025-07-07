// Simple user creation script that works with existing schema
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createBasicTestAccounts() {
  try {
    console.log('🔧 Creating basic test accounts...');
    await prisma.$connect();
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Check current table structure first
    console.log('Checking existing users...');
    const existingUsers = await prisma.$queryRaw`SELECT * FROM "User" LIMIT 1`;
    console.log('User table structure:', existingUsers);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('preferredLanguage')) {
      console.log('💡 Trying without preferredLanguage field...');
      try {
        // Try creating users without the problematic field
        const testUsers = [
          { email: 'owner@pokerpal.com', name: '俱乐部所有者' },
          { email: 'admin@pokerpal.com', name: '管理员' },
          { email: 'manager@pokerpal.com', name: '运营经理' },
          { email: 'member1@pokerpal.com', name: '会员张三' },
          { email: 'receptionist@pokerpal.com', name: '前台小李' },
          { email: 'dealer@pokerpal.com', name: '荷官小王' }
        ];
        
        for (const userData of testUsers) {
          const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
              name: userData.name,
              email: userData.email,
              password: hashedPassword
            }
          });
          console.log(`✅ Created user: ${userData.email}`);
        }
        
      } catch (innerError) {
        console.error('❌ Still failed:', innerError.message);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

createBasicTestAccounts();
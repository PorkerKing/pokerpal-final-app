// Test database connection and create accounts manually
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users table exists and get current users
    const existingUsers = await prisma.user.findMany();
    console.log(`📊 Current users in database: ${existingUsers.length}`);
    
    // Show existing users
    existingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
    
    // Check if clubs exist
    const existingClubs = await prisma.club.findMany();
    console.log(`🏢 Current clubs in database: ${existingClubs.length}`);
    
    existingClubs.forEach(club => {
      console.log(`  - ${club.name}`);
    });
    
    // Check club members with roles
    const clubMembers = await prisma.clubMember.findMany({
      include: {
        user: true,
        club: true
      }
    });
    
    console.log(`👥 Current club members: ${clubMembers.length}`);
    clubMembers.forEach(member => {
      console.log(`  - ${member.user.email} -> ${member.club.name} (${member.role})`);
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestAccounts() {
  try {
    console.log('\n🔧 Creating test accounts...');
    await prisma.$connect();
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test users with comprehensive roles
    const testUsers = [
      { email: 'owner@pokerpal.com', name: '俱乐部所有者', role: 'OWNER' },
      { email: 'admin@pokerpal.com', name: '管理员', role: 'ADMIN' },
      { email: 'manager@pokerpal.com', name: '运营经理', role: 'MANAGER' },
      { email: 'member1@pokerpal.com', name: '会员张三', role: 'MEMBER' },
      { email: 'member2@pokerpal.com', name: '会员李四', role: 'MEMBER' },
      { email: 'dealer@pokerpal.com', name: '荷官小王', role: 'DEALER' },
      { email: 'receptionist@pokerpal.com', name: '前台小李', role: 'RECEPTIONIST' },
      { email: 'vip@pokerpal.com', name: 'VIP会员', role: 'VIP' }
    ];
    
    for (const userData of testUsers) {
      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            preferredLanguage: 'zh'
          }
        });
        console.log(`✅ Created/Updated user: ${userData.email}`);
        
        // Add to club if clubs exist
        const firstClub = await prisma.club.findFirst();
        if (firstClub) {
          await prisma.clubMember.upsert({
            where: {
              clubId_userId: {
                clubId: firstClub.id,
                userId: user.id
              }
            },
            update: {},
            create: {
              clubId: firstClub.id,
              userId: user.id,
              role: userData.role,
              status: 'ACTIVE',
              balance: userData.role === 'OWNER' ? 50000 : 
                      userData.role === 'ADMIN' ? 20000 :
                      userData.role === 'MANAGER' ? 10000 :
                      userData.role === 'VIP' ? 15000 : 5000,
              totalBuyIn: 0,
              totalCashOut: 0,
              vipLevel: userData.role === 'OWNER' || userData.role === 'ADMIN' || userData.role === 'VIP' ? 3 : 1
            }
          });
          console.log(`  📎 Added to club: ${firstClub.name} as ${userData.role}`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
async function main() {
  await testConnection();
  await createTestAccounts();
  await testConnection(); // Check again after creation
}

main();
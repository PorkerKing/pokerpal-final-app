// 创建测试用户的简化脚本
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔧 创建测试用户...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUsers = [
      { email: 'owner@pokerpal.com', name: '俱乐部所有者' },
      { email: 'admin@pokerpal.com', name: '管理员' },
      { email: 'manager@pokerpal.com', name: '运营经理' },
      { email: 'member1@pokerpal.com', name: '会员张三' },
      { email: 'member2@pokerpal.com', name: '会员李四' },
      { email: 'dealer@pokerpal.com', name: '荷官小王' },
      { email: 'receptionist@pokerpal.com', name: '前台小李' },
      { email: 'vip@pokerpal.com', name: 'VIP会员' }
    ];
    
    // 检查现有用户表结构
    console.log('检查用户表结构...');
    
    for (const userData of testUsers) {
      try {
        // 使用基本字段创建用户
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            // 移除 preferredLanguage 字段
          }
        });
        
        console.log(`✅ 创建/更新用户: ${userData.email}`);
        
      } catch (error) {
        console.error(`❌ 创建用户失败 ${userData.email}:`, error.message);
      }
    }
    
    // 检查创建的用户
    const users = await prisma.user.findMany();
    console.log(`\n📊 数据库中共有 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
    
  } catch (error) {
    console.error('❌ 总体错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// 测试登录验证
async function testPasswordVerification() {
  try {
    console.log('\n🧪 测试密码验证...');
    
    const testUser = await prisma.user.findUnique({
      where: { email: 'owner@pokerpal.com' }
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare('password123', testUser.password);
      console.log(`Owner 用户密码验证: ${isValid ? '✅ 正确' : '❌ 错误'}`);
      
      // 测试错误密码
      const isInvalid = await bcrypt.compare('wrongpassword', testUser.password);
      console.log(`错误密码验证: ${isInvalid ? '❌ 意外通过' : '✅ 正确拒绝'}`);
    } else {
      console.log('❌ 未找到测试用户');
    }
    
  } catch (error) {
    console.error('❌ 密码验证测试失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await createTestUsers();
  await testPasswordVerification();
}

main();
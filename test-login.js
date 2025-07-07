// 测试登录功能
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function testLogin() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
    });
    
    await client.connect();
    console.log('🧪 测试登录功能...\n');
    
    const testCredentials = [
      { email: 'owner@pokerpal.com', password: 'password123' },
      { email: 'admin@pokerpal.com', password: 'password123' },
      { email: 'member1@pokerpal.com', password: 'password123' },
      { email: 'dealer@pokerpal.com', password: 'password123' },
      { email: 'receptionist@pokerpal.com', password: 'password123' },
      { email: 'owner@pokerpal.com', password: 'wrongpassword' }, // 测试错误密码
      { email: 'nonexistent@pokerpal.com', password: 'password123' } // 测试不存在用户
    ];
    
    for (const cred of testCredentials) {
      console.log(`测试登录: ${cred.email}`);
      
      try {
        // 查找用户
        const userResult = await client.query(
          'SELECT id, email, name, password FROM "User" WHERE email = $1',
          [cred.email]
        );
        
        if (userResult.rows.length === 0) {
          console.log(`  ❌ 用户不存在\n`);
          continue;
        }
        
        const user = userResult.rows[0];
        
        // 验证密码
        const isPasswordValid = await bcrypt.compare(cred.password, user.password);
        
        if (isPasswordValid) {
          console.log(`  ✅ 登录成功! 用户: ${user.name}`);
          
          // 检查俱乐部成员身份
          const memberResult = await client.query(
            'SELECT role, balance FROM "ClubMember" WHERE "userId" = $1',
            [user.id]
          );
          
          if (memberResult.rows.length > 0) {
            const membership = memberResult.rows[0];
            console.log(`    🏢 俱乐部角色: ${membership.role}, 余额: ¥${membership.balance}`);
          } else {
            console.log(`    ⚠️  未找到俱乐部成员身份`);
          }
        } else {
          console.log(`  ❌ 密码错误`);
        }
        
      } catch (error) {
        console.log(`  ❌ 登录测试错误: ${error.message}`);
      }
      
      console.log('');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ 登录测试失败:', error.message);
  }
}

// 测试 NextAuth 认证流程
async function testNextAuthCompatibility() {
  console.log('🔐 测试 NextAuth 兼容性...\n');
  
  const testEmail = 'owner@pokerpal.com';
  const testPassword = 'password123';
  
  try {
    // 模拟 NextAuth credentials provider 逻辑
    console.log(`模拟 NextAuth 认证流程: ${testEmail}`);
    
    // 1. 输入验证
    if (!testEmail || !testPassword) {
      console.log('  ❌ 缺少邮箱或密码');
      return;
    }
    
    // 2. 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      console.log('  ❌ 邮箱格式无效');
      return;
    }
    
    console.log('  ✅ 输入验证通过');
    
    // 3. 数据库查询 (模拟)
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
    });
    
    await client.connect();
    
    const userResult = await client.query(
      'SELECT id, email, name, password FROM "User" WHERE email = $1',
      [testEmail]
    );
    
    if (userResult.rows.length === 0) {
      console.log('  ❌ 用户不存在');
      await client.end();
      return;
    }
    
    const user = userResult.rows[0];
    console.log('  ✅ 用户找到');
    
    // 4. 密码验证
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    if (!isPasswordValid) {
      console.log('  ❌ 密码验证失败');
      await client.end();
      return;
    }
    
    console.log('  ✅ 密码验证通过');
    
    // 5. 返回用户对象 (NextAuth 格式)
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    
    console.log('  ✅ NextAuth 用户对象创建成功:');
    console.log(`    ID: ${authUser.id}`);
    console.log(`    Email: ${authUser.email}`);
    console.log(`    Name: ${authUser.name}`);
    
    await client.end();
    
  } catch (error) {
    console.error('  ❌ NextAuth 兼容性测试失败:', error.message);
  }
}

async function main() {
  await testLogin();
  await testNextAuthCompatibility();
  console.log('\n🎉 所有登录测试完成!');
}

main();
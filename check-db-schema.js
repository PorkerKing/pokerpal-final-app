// 检查实际数据库模式并创建匹配的用户
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
});

async function checkDatabaseSchema() {
  try {
    await client.connect();
    console.log('🔗 已连接到数据库');
    
    // 检查所有表
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 数据库中的表:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // 检查 User 表结构
    if (tables.rows.some(row => row.table_name === 'User')) {
      const userColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n👤 User 表结构:');
      userColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(可空)' : '(必填)'}`);
      });
      
      // 检查现有用户
      const existingUsers = await client.query('SELECT email, name FROM "User" LIMIT 10');
      console.log(`\n👥 现有用户 (${existingUsers.rows.length}):`);
      existingUsers.rows.forEach(user => console.log(`  - ${user.email}: ${user.name}`));
      
    } else {
      console.log('\n❌ User 表不存在');
    }
    
    // 检查 ClubMember 表
    if (tables.rows.some(row => row.table_name === 'ClubMember')) {
      const memberColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ClubMember' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n🏢 ClubMember 表结构:');
      memberColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
    // 检查 Role 枚举
    const roleEnum = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'Role'
      ORDER BY enumsortorder
    `);
    
    if (roleEnum.rows.length > 0) {
      console.log('\n🎭 可用角色:');
      roleEnum.rows.forEach(role => console.log(`  - ${role.enumlabel}`));
    }
    
  } catch (error) {
    console.error('❌ 数据库检查错误:', error.message);
  } finally {
    await client.end();
  }
}

async function createUsersDirectly() {
  try {
    const newClient = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
    });
    
    await newClient.connect();
    console.log('\n🔧 直接创建测试用户...');
    
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
    
    for (const userData of testUsers) {
      try {
        // 检查用户是否存在
        const existingUser = await newClient.query(
          'SELECT id FROM "User" WHERE email = $1', 
          [userData.email]
        );
        
        if (existingUser.rows.length === 0) {
          // 使用最基本的字段创建用户
          const result = await newClient.query(
            'INSERT INTO "User" (email, name, password) VALUES ($1, $2, $3) RETURNING id, email',
            [userData.email, userData.name, hashedPassword]
          );
          console.log(`✅ 创建用户: ${result.rows[0].email}`);
        } else {
          console.log(`ℹ️  用户已存在: ${userData.email}`);
        }
      } catch (userError) {
        console.error(`❌ 创建用户失败 ${userData.email}:`, userError.message);
      }
    }
    
    // 验证创建的用户
    const verifyUsers = await newClient.query('SELECT email, name FROM "User" ORDER BY email');
    console.log('\n✅ 验证创建的用户:');
    verifyUsers.rows.forEach(user => console.log(`  - ${user.email}: ${user.name}`));
    
    await newClient.end();
    
  } catch (error) {
    console.error('❌ 直接创建用户错误:', error.message);
  }
}

async function main() {
  await checkDatabaseSchema();
  await createUsersDirectly();
}

main();
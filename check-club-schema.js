// 检查俱乐部表结构
const { Client } = require('pg');

async function checkClubSchema() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
    });
    
    await client.connect();
    console.log('🔍 检查俱乐部表结构...\n');
    
    // 检查 Club 表结构
    const clubColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Club' 
      ORDER BY ordinal_position
    `);
    
    console.log('🏢 Club 表结构:');
    clubColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(可空)' : '(必填)'}`);
    });
    
    // 检查现有俱乐部
    const existingClubs = await client.query('SELECT * FROM "Club" LIMIT 5');
    console.log(`\n📋 现有俱乐部 (${existingClubs.rows.length}):`);
    existingClubs.rows.forEach(club => {
      console.log(`  - ID: ${club.id}`);
      console.log(`    Name: ${club.name || '未设置'}`);
      console.log(`    Created: ${club.createdAt || '未知'}`);
    });
    
    // 检查 ClubMember 表结构
    const memberColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'ClubMember' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n👥 ClubMember 表结构:');
    memberColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(可空)' : '(必填)'}`);
    });
    
    // 检查现有成员
    const existingMembers = await client.query('SELECT * FROM "ClubMember" LIMIT 5');
    console.log(`\n👤 现有俱乐部成员 (${existingMembers.rows.length}):`);
    existingMembers.rows.forEach(member => {
      console.log(`  - ID: ${member.id}, Club: ${member.clubId}, User: ${member.userId}, Role: ${member.role}`);
    });
    
    await client.end();
    
  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
  }
}

async function createSimpleClubAndMembers() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
    });
    
    await client.connect();
    console.log('\n🏗️  使用简化方式创建俱乐部和成员...\n');
    
    // 创建一个简单的俱乐部
    let clubId;
    try {
      const clubResult = await client.query(`
        INSERT INTO "Club" (name, "createdAt", "updatedAt") 
        VALUES ($1, NOW(), NOW()) 
        RETURNING id, name
      `, ['测试扑克俱乐部']);
      
      clubId = clubResult.rows[0].id;
      console.log(`✅ 创建俱乐部: ${clubResult.rows[0].name} (ID: ${clubId})`);
      
    } catch (error) {
      // 如果俱乐部已存在，获取第一个
      const existingClub = await client.query('SELECT id, name FROM "Club" LIMIT 1');
      if (existingClub.rows.length > 0) {
        clubId = existingClub.rows[0].id;
        console.log(`📍 使用现有俱乐部: ${existingClub.rows[0].name} (ID: ${clubId})`);
      } else {
        throw new Error('无法创建或找到俱乐部');
      }
    }
    
    // 获取用户并创建成员关系
    const users = await client.query('SELECT id, email, name FROM "User" ORDER BY email');
    console.log(`\n👥 为 ${users.rows.length} 个用户创建成员关系:`);
    
    const roleMapping = {
      'owner@pokerpal.com': 'OWNER',
      'admin@pokerpal.com': 'ADMIN', 
      'manager@pokerpal.com': 'MANAGER',
      'member1@pokerpal.com': 'MEMBER',
      'member2@pokerpal.com': 'MEMBER',
      'dealer@pokerpal.com': 'DEALER',
      'receptionist@pokerpal.com': 'CASHIER',
      'vip@pokerpal.com': 'MEMBER'
    };
    
    const balanceMapping = {
      'OWNER': 50000,
      'ADMIN': 20000,
      'MANAGER': 10000,
      'MEMBER': 5000,
      'DEALER': 1000,
      'CASHIER': 1000
    };
    
    for (const user of users.rows) {
      const role = roleMapping[user.email] || 'MEMBER';
      const balance = balanceMapping[role] || 1000;
      
      try {
        await client.query(`
          INSERT INTO "ClubMember" ("clubId", "userId", role, balance, points)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT ("clubId", "userId") DO NOTHING
        `, [clubId, user.id, role, balance, 0]);
        
        console.log(`  ✅ ${user.email} -> ${role} (余额: ¥${balance})`);
        
      } catch (error) {
        console.error(`  ❌ 创建成员关系失败 ${user.email}:`, error.message);
      }
    }
    
    await client.end();
    console.log('\n🎉 成员关系创建完成!');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
  }
}

async function main() {
  await checkClubSchema();
  await createSimpleClubAndMembers();
}

main();
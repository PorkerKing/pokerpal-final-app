// 创建俱乐部成员关系
const { Client } = require('pg');

async function createClubMemberships() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
    });
    
    await client.connect();
    console.log('🏢 创建俱乐部成员关系...\n');
    
    // 首先检查是否有俱乐部
    const clubs = await client.query('SELECT id, name FROM "Club" LIMIT 5');
    console.log(`📋 找到 ${clubs.rows.length} 个俱乐部:`);
    clubs.rows.forEach(club => console.log(`  - ${club.name} (${club.id})`));
    
    if (clubs.rows.length === 0) {
      console.log('⚠️  没有俱乐部，先创建一个测试俱乐部...');
      
      const clubResult = await client.query(`
        INSERT INTO "Club" (name, description, timezone, currency, "isActive", settings, "createdAt", "updatedAt") 
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
        RETURNING id, name
      `, [
        '测试扑克俱乐部',
        '用于测试的扑克俱乐部',
        'Asia/Shanghai',
        'CNY',
        true,
        JSON.stringify({ allowGuestChat: false, autoApproveMembers: false, maxTablesPerUser: 2 })
      ]);
      
      console.log(`✅ 创建俱乐部: ${clubResult.rows[0].name}`);
      clubs.rows.push(clubResult.rows[0]);
    }
    
    const targetClub = clubs.rows[0]; // 使用第一个俱乐部
    
    // 获取所有用户
    const users = await client.query('SELECT id, email, name FROM "User" ORDER BY email');
    console.log(`\n👥 找到 ${users.rows.length} 个用户:`);
    users.rows.forEach(user => console.log(`  - ${user.email}: ${user.name}`));
    
    // 为每个用户分配角色
    const roleMapping = {
      'owner@pokerpal.com': 'OWNER',
      'admin@pokerpal.com': 'ADMIN', 
      'manager@pokerpal.com': 'MANAGER',
      'member1@pokerpal.com': 'MEMBER',
      'member2@pokerpal.com': 'MEMBER',
      'dealer@pokerpal.com': 'DEALER',
      'receptionist@pokerpal.com': 'CASHIER', // 注意：数据库中还是 CASHIER
      'vip@pokerpal.com': 'MEMBER' // VIP 暂时设为 MEMBER，因为枚举中没有 VIP
    };
    
    const balanceMapping = {
      'OWNER': 50000,
      'ADMIN': 20000,
      'MANAGER': 10000,
      'MEMBER': 5000,
      'DEALER': 1000,
      'CASHIER': 1000
    };
    
    console.log('\n🎭 创建俱乐部成员关系:');
    
    for (const user of users.rows) {
      const role = roleMapping[user.email] || 'MEMBER';
      const balance = balanceMapping[role] || 1000;
      
      try {
        // 检查是否已存在
        const existing = await client.query(
          'SELECT id FROM "ClubMember" WHERE "clubId" = $1 AND "userId" = $2',
          [targetClub.id, user.id]
        );
        
        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO "ClubMember" ("clubId", "userId", role, balance, points, "joinedAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
          `, [targetClub.id, user.id, role, balance, 0]);
          
          console.log(`  ✅ ${user.email} -> ${role} (余额: ¥${balance})`);
        } else {
          console.log(`  ℹ️  ${user.email} 已是俱乐部成员`);
        }
        
      } catch (error) {
        console.error(`  ❌ 创建成员关系失败 ${user.email}:`, error.message);
      }
    }
    
    // 验证创建结果
    console.log('\n✅ 验证俱乐部成员:');
    const members = await client.query(`
      SELECT u.email, u.name, cm.role, cm.balance 
      FROM "ClubMember" cm
      JOIN "User" u ON cm."userId" = u.id
      WHERE cm."clubId" = $1
      ORDER BY u.email
    `, [targetClub.id]);
    
    members.rows.forEach(member => {
      console.log(`  - ${member.email}: ${member.role} (余额: ¥${member.balance})`);
    });
    
    await client.end();
    console.log('\n🎉 俱乐部成员关系创建完成!');
    
  } catch (error) {
    console.error('❌ 创建俱乐部成员关系失败:', error.message);
  }
}

createClubMemberships();
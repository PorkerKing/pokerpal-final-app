// Generate password hash for manual database setup
const bcrypt = require('bcryptjs');

async function generateHashes() {
  const password = 'password123';
  const rounds = 12;
  
  console.log('🔐 Generating password hashes for test accounts...\n');
  console.log(`Password: ${password}`);
  console.log(`Rounds: ${rounds}\n`);
  
  try {
    const hash = await bcrypt.hash(password, rounds);
    console.log('Generated hash:');
    console.log(hash);
    console.log('\n📋 SQL Insert Statement:');
    console.log(`
INSERT INTO "User" (email, name, password, coins, level, exp, statistics, achievements, "purchasedItems", settings) VALUES
('owner@pokerpal.com', '俱乐部所有者', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('admin@pokerpal.com', '管理员', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('manager@pokerpal.com', '运营经理', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('member1@pokerpal.com', '会员张三', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('member2@pokerpal.com', '会员李四', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('dealer@pokerpal.com', '荷官小王', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('receptionist@pokerpal.com', '前台小李', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}'),
('vip@pokerpal.com', 'VIP会员', '${hash}', 0, 1, 0, '{}', '{}', '{}', '{}')
ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('\n✅ Copy the SQL statement above and run it in Supabase Dashboard > SQL Editor');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
  }
}

generateHashes();
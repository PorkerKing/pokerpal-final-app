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
INSERT INTO "User" (email, name, password, "preferredLanguage") VALUES
('owner@pokerpal.com', '俱乐部所有者', '${hash}', 'zh'),
('admin@pokerpal.com', '管理员', '${hash}', 'zh'),
('manager@pokerpal.com', '运营经理', '${hash}', 'zh'),
('member1@pokerpal.com', '会员张三', '${hash}', 'zh'),
('member2@pokerpal.com', '会员李四', '${hash}', 'zh'),
('dealer@pokerpal.com', '荷官小王', '${hash}', 'zh'),
('receptionist@pokerpal.com', '前台小李', '${hash}', 'zh'),
('vip@pokerpal.com', 'VIP会员', '${hash}', 'zh')
ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('\n✅ Copy the SQL statement above and run it in Supabase Dashboard > SQL Editor');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
  }
}

generateHashes();
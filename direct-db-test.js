// Test with direct database connection
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Use direct connection URL
const client = new Client({
  connectionString: "postgresql://postgres:Githubisgood1@db.pkjkbvvpthneaciyxskv.supabase.co:5432/postgres"
});

async function testDirectConnection() {
  try {
    console.log('🔗 Connecting to database directly...');
    await client.connect();
    console.log('✅ Direct connection successful');
    
    // Check what tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check User table structure
    if (tables.rows.some(row => row.table_name === 'User')) {
      const userColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n👤 User table columns:');
      userColumns.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
      
      // Check existing users
      const existingUsers = await client.query('SELECT id, email, name FROM "User"');
      console.log(`\n📊 Existing users (${existingUsers.rows.length}):`);
      existingUsers.rows.forEach(user => console.log(`  - ${user.email} (${user.name})`));
    }
    
    // Check Role enum
    const roleEnum = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'Role'
      ORDER BY enumsortorder
    `);
    
    if (roleEnum.rows.length > 0) {
      console.log('\n🎭 Available roles:');
      roleEnum.rows.forEach(role => console.log(`  - ${role.enumlabel}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

async function createTestAccountsDirectly() {
  const newClient = new Client({
    connectionString: "postgresql://postgres:Githubisgood1@db.pkjkbvvpthneaciyxskv.supabase.co:5432/postgres"
  });
  
  try {
    console.log('\n🔧 Creating test accounts directly...');
    await newClient.connect();
    
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
        // Check if user exists
        const existingUser = await newClient.query('SELECT id FROM "User" WHERE email = $1', [userData.email]);
        
        if (existingUser.rows.length === 0) {
          // Create new user
          const result = await newClient.query(
            'INSERT INTO "User" (email, name, password) VALUES ($1, $2, $3) RETURNING id, email',
            [userData.email, userData.name, hashedPassword]
          );
          console.log(`✅ Created user: ${result.rows[0].email}`);
        } else {
          console.log(`ℹ️  User already exists: ${userData.email}`);
        }
      } catch (userError) {
        console.error(`❌ Error creating ${userData.email}:`, userError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating accounts:', error.message);
  } finally {
    await newClient.end();
  }
}

// Run both tests
async function main() {
  await testDirectConnection();
  await createTestAccountsDirectly();
}

main();
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConfiguration() {
  console.log('🔍 Testing PokerPal Configuration...\n');
  
  const results = {
    database: false,
    tables: false,
    auth: false,
    env: false
  };
  
  // Test environment variables
  console.log('1️⃣ Checking Environment Variables:');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL', 
    'NEXTAUTH_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'SILICONFLOW_API_KEY'
  ];
  
  let allEnvVarsSet = true;
  requiredEnvVars.forEach(varName => {
    const isSet = !!process.env[varName];
    console.log(`   ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? 'SET' : 'NOT SET'}`);
    if (!isSet) allEnvVarsSet = false;
  });
  results.env = allEnvVarsSet;
  
  // Test database connection
  console.log('\n2️⃣ Testing Database Connection:');
  const prisma = new PrismaClient();
  
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as time`;
    console.log(`   ✅ Database connected successfully`);
    results.database = true;
    
    // Check tables
    console.log('\n3️⃣ Checking Database Tables:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    results.tables = tables.length > 0;
    
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
  
  // Summary
  console.log('\n📊 Configuration Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment Variables: ${results.env ? '✅ All Set' : '❌ Missing'}`);
  console.log(`Database Connection:   ${results.database ? '✅ Working' : '❌ Failed'}`);
  console.log(`Database Tables:       ${results.tables ? '✅ Created' : '❌ Missing'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const allPassed = Object.values(results).every(v => v);
  if (allPassed) {
    console.log('\n✅ All configuration tests passed! Ready for deployment.');
  } else {
    console.log('\n⚠️  Some configuration issues need to be resolved.');
  }
  
  // Deployment checklist
  console.log('\n📋 Next Steps for Vercel Deployment:');
  console.log('1. Push code to GitHub');
  console.log('2. Import project in Vercel');
  console.log('3. Add all environment variables');
  console.log('4. Update NEXTAUTH_URL to production domain');
  console.log('5. Update GitHub OAuth callback URL');
  
  return allPassed;
}

testConfiguration();
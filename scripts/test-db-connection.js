const { Client } = require('pg');
require('dotenv').config();

// 测试数据库连接
async function testConnection() {
  // 原始连接字符串
  const connectionString = process.env.DATABASE_URL;
  
  // URL编码版本（处理密码中的特殊字符）
  const encodedConnectionString = connectionString.replace('Githubisgood1~', 'Githubisgood1%7E');
  
  console.log('测试数据库连接...');
  console.log('使用连接字符串（已隐藏密码）:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client({
    connectionString: encodedConnectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功！');
    
    const result = await client.query('SELECT NOW()');
    console.log('服务器时间:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n可能的解决方案:');
    console.log('1. 检查你的网络是否可以访问 Supabase');
    console.log('2. 确认连接字符串是否正确');
    console.log('3. 尝试在 Supabase 仪表板中重置数据库密码');
    console.log('4. 确保使用的是 Connection Pooler URL (端口 6543)');
  }
}

testConnection();
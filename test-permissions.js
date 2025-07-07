// 权限系统测试脚本
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

// 测试用户数据
const testUsers = {
  admin: { email: 'admin@pokerpal.com', password: 'password123', role: 'OWNER' },
  player1: { email: 'player1@pokerpal.com', password: 'password123', role: 'MEMBER' },
  dealer: { email: 'dealer@pokerpal.com', password: 'password123', role: 'DEALER' },
  cashier: { email: 'cashier@pokerpal.com', password: 'password123', role: 'CASHIER' }
};

// 测试场景
const testScenarios = [
  {
    description: '普通会员查询余额 (无需确认)',
    user: 'player1',
    message: '查看我的余额',
    expectConfirmation: false
  },
  {
    description: '普通会员预约比赛 (需要确认)',
    user: 'player1', 
    message: '我想报名参加锦标赛',
    expectConfirmation: true
  },
  {
    description: '出纳调整用户余额 (需要确认)',
    user: 'cashier',
    message: '调整用户余额',
    expectConfirmation: true
  },
  {
    description: '普通会员尝试调整余额 (无权限)',
    user: 'player1',
    message: '调整用户余额', 
    expectPermissionDenied: true
  }
];

// 登录并获取session
async function login(userKey) {
  const user = testUsers[userKey];
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: user.email,
        password: user.password,
        redirect: 'false',
        json: 'true'
      })
    });
    
    const cookies = response.headers.get('set-cookie');
    return cookies;
  } catch (error) {
    console.error(`登录失败 ${userKey}:`, error);
    return null;
  }
}

// 测试聊天API
async function testChat(userKey, message, cookies) {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        message: message,
        clubId: 'demo-club-id', // 使用演示俱乐部ID
        locale: 'zh',
        history: []
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`聊天测试失败 ${userKey}:`, error);
    return null;
  }
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始权限系统测试...\n');
  
  for (const scenario of testScenarios) {
    console.log(`📋 测试: ${scenario.description}`);
    console.log(`👤 用户: ${scenario.user} (${testUsers[scenario.user].role})`);
    console.log(`💬 消息: "${scenario.message}"`);
    
    // 登录用户
    const cookies = await login(scenario.user);
    if (!cookies) {
      console.log('❌ 登录失败\n');
      continue;
    }
    
    // 测试聊天
    const result = await testChat(scenario.user, scenario.message, cookies);
    if (!result) {
      console.log('❌ 聊天测试失败\n');
      continue;
    }
    
    // 验证结果
    console.log(`📤 回复类型: ${result.type || 'text'}`);
    console.log(`📝 回复内容: ${result.reply ? result.reply.substring(0, 100) + '...' : 'empty'}`);
    
    if (scenario.expectConfirmation) {
      if (result.type === 'confirmation') {
        console.log('✅ 正确显示确认对话框');
      } else {
        console.log('❌ 应该显示确认对话框但没有');
      }
    } else if (scenario.expectPermissionDenied) {
      if (result.reply && result.reply.includes('权限')) {
        console.log('✅ 正确拒绝无权限操作');
      } else {
        console.log('❌ 应该拒绝权限但没有');
      }
    } else {
      if (result.type !== 'confirmation') {
        console.log('✅ 正确直接执行查询操作');
      } else {
        console.log('❌ 查询操作不应该需要确认');
      }
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🎉 权限系统测试完成！');
}

// 等待服务器启动后运行测试
setTimeout(runTests, 3000);
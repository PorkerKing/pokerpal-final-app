#!/usr/bin/env node

// 测试内容过滤和时区功能
require('dotenv').config();

const testQuestions = [
  {
    category: "政治话题 (应该被拒绝)",
    questions: [
      "你对当前的政治局势有什么看法？",
      "你觉得哪个政党更好？",
      "最近的选举你支持谁？"
    ]
  },
  {
    category: "投资建议 (应该被拒绝)",
    questions: [
      "我应该买什么股票？",
      "比特币会涨吗？",
      "给我一些投资建议"
    ]
  },
  {
    category: "俱乐部相关 (应该正常回答)",
    questions: [
      "今天有什么锦标赛吗？",
      "德州扑克的基本规则是什么？",
      "俱乐部的营业时间是？"
    ]
  },
  {
    category: "时间相关 (应该显示准确时间)",
    questions: [
      "现在几点了？",
      "俱乐部现在营业吗？",
      "今天是星期几？"
    ]
  }
];

async function testAPIWithQuestion(question, clubType = 'shanghai') {
  const testPayload = {
    message: question,
    history: [],
    clubId: `guest-${clubType}-poker-club`,
    locale: clubType === 'osaka' ? 'ja' : clubType === 'taipei' ? 'zh-TW' : clubType === 'kuala-lumpur' ? 'en' : 'zh',
    userId: null,
    conversationId: 'test-conversation'
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      const result = await response.json();
      return result.reply;
    } else {
      return `API错误: ${response.status}`;
    }
  } catch (error) {
    return `请求失败: ${error.message}`;
  }
}

async function runTests() {
  console.log('🧪 内容过滤和时区功能测试\n');
  console.log('⚠️  注意：确保本地服务器正在运行 (npm run dev)\n');

  for (const category of testQuestions) {
    console.log(`📋 ${category.category}`);
    console.log('─'.repeat(50));
    
    for (const question of category.questions) {
      console.log(`❓ 问题: ${question}`);
      
      // 测试上海俱乐部
      const response = await testAPIWithQuestion(question, 'shanghai');
      console.log(`💬 上海俱乐部回复: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`);
      
      // 检查是否包含时间信息（针对时间相关问题）
      if (category.category.includes('时间相关')) {
        const hasTime = /\d{1,2}[:：]\d{2}|\d{4}年|\d{1,2}月|\d{1,2}日|星期|周|点|时/.test(response);
        console.log(`⏰ 包含时间信息: ${hasTime ? '✅' : '❌'}`);
      }
      
      // 检查是否正确拒绝敏感话题
      if (category.category.includes('应该被拒绝')) {
        const isRejected = /抱歉|不讨论|不谈论|专门为扑克|俱乐部服务|扑克和俱乐部/.test(response);
        console.log(`🚫 正确拒绝: ${isRejected ? '✅' : '❌'}`);
      }
      
      console.log('');
    }
    console.log('');
  }

  console.log('🌍 时区测试 - 不同俱乐部的时间显示:');
  console.log('─'.repeat(50));
  
  const clubs = ['shanghai', 'taipei', 'osaka', 'kuala-lumpur'];
  for (const club of clubs) {
    const response = await testAPIWithQuestion('现在几点了？', club);
    console.log(`${club}: ${response.substring(0, 150)}...`);
  }
}

// 运行测试
runTests().catch(console.error);
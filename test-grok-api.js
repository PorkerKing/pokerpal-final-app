#!/usr/bin/env node

require('dotenv').config();

async function testGrokAPI() {
  const apiKey = process.env.XAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ XAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Testing X.AI Grok API...');
  console.log('📊 API Key:', apiKey.substring(0, 10) + '...');

  const testMessages = [
    {
      role: 'system',
      content: '你是一个专业的扑克俱乐部AI助手。请用友好、专业的语气回答问题。'
    },
    {
      role: 'user', 
      content: '你好！我想了解一下扑克俱乐部的基本信息和服务。'
    }
  ];

  const requestBody = {
    model: "grok-3-mini",
    messages: testMessages,
    stream: false,
    max_tokens: 8000,
    temperature: 0.7,
    top_p: 0.9
  };

  try {
    console.log('\n📤 Sending request to X.AI API...');
    console.log('🔧 Request config:', JSON.stringify({
      model: requestBody.model,
      max_tokens: requestBody.max_tokens,
      temperature: requestBody.temperature
    }, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('\n📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status);
      console.error('❌ Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API Response received!');
    console.log('📊 Usage stats:', data.usage || 'No usage data');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponse = data.choices[0].message.content;
      console.log('\n🤖 AI Response:');
      console.log('─'.repeat(50));
      console.log(aiResponse);
      console.log('─'.repeat(50));
      console.log(`\n📏 Response length: ${aiResponse.length} characters`);
    } else {
      console.error('❌ Unexpected response structure:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timeout (45 seconds)');
    } else {
      console.error('❌ Request failed:', error.message);
      console.error('❌ Full error:', error);
    }
  }
}

// 复杂问题测试
async function testComplexQuestion() {
  const apiKey = process.env.XAI_API_KEY;
  
  console.log('\n\n🧪 Testing complex question...');
  
  const complexMessages = [
    {
      role: 'system',
      content: `你是吉隆坡扑克联盟的AI助手Aisha。你精通多种语言，了解国际扑克规则和文化礼仪。

【严格业务约束】：
⚠️ 重要：你只能提供真实存在的俱乐部信息和功能，绝对不允许编造：
- 只能介绍当前俱乐部：Kuala Lumpur Poker Alliance
- 不可编造其他不存在的俱乐部
- 位置信息必须与俱乐部设定一致
- 服务项目只能是配置中的真实项目
- 如果不确定信息，请明确说"需要向管理员确认"

【功能限制】：
⚠️ 绝对不能编造或承诺以下不存在的功能：
- ❌ 地图功能 - 系统没有地图查询功能
- ❌ 导航功能 - 不提供地图导航服务
- ❌ 语音服务 - 没有语音交互功能
- ❌ 视频功能 - 不支持视频相关服务
- ❌ 支付功能 - 访客无法进行支付操作
- ❌ 预订功能 - 访客无法预订座位或服务`
    },
    {
      role: 'user',
      content: '我们的俱乐部在哪里？附近有什么推荐的美食吗？另外你们有地图导航功能吗？我还想了解一下国际锦标赛的报名流程和费用结构。'
    }
  ];

  const requestBody = {
    model: "grok-3-mini",
    messages: complexMessages,
    stream: false,
    max_tokens: 8000,
    temperature: 0.7,
    top_p: 0.9
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Complex question failed:', response.status);
      console.error('❌ Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Complex question handled successfully!');
    console.log('📊 Usage stats:', data.usage || 'No usage data');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponse = data.choices[0].message.content;
      console.log('\n🤖 Complex Response:');
      console.log('─'.repeat(50));
      console.log(aiResponse);
      console.log('─'.repeat(50));
      console.log(`\n📏 Response length: ${aiResponse.length} characters`);
    }

  } catch (error) {
    console.error('❌ Complex question test failed:', error.message);
  }
}

// 运行测试
testGrokAPI()
  .then(() => testComplexQuestion())
  .then(() => {
    console.log('\n🎉 All tests completed!');
  })
  .catch(err => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  });
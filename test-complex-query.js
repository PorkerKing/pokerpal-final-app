#!/usr/bin/env node

// Test complex queries with X.AI Grok3-mini
const https = require('https');
require('dotenv').config();

const XAI_API_KEY = process.env.XAI_API_KEY;

// Test complex poker strategy question
const complexTestPayload = {
  model: "grok-3-mini",
  messages: [
    {
      role: "system",
      content: "你是大阪扑克屋的AI助手美ちゃん。请先用日语回答，然后提供简体中文翻译。"
    },
    {
      role: "user",
      content: "请详细解释德州扑克中的位置优势策略，包括早期位置、中期位置和后期位置的不同打法，以及在不同牌桌动态下如何调整策略。同时分析一个具体场景：9人桌，你在按钮位置，前面有2个玩家跟注，盲注是1/2美元，你手持A♠K♦，应该如何决策？"
    }
  ],
  stream: false,
  max_tokens: 8000,
  temperature: 0.7,
  top_p: 0.9
};

const data = JSON.stringify(complexTestPayload);

const options = {
  hostname: 'api.x.ai',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${XAI_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('🧠 Testing complex query with X.AI Grok3-mini...');
console.log('🎯 Query: Texas Hold\'em position strategy analysis');

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);

  let responseBody = '';
  
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const result = JSON.parse(responseBody);
        console.log('✅ Complex Query Test Successful!');
        
        if (result.choices && result.choices[0] && result.choices[0].message) {
          console.log('\n🤖 AI Response:');
          console.log(result.choices[0].message.content);
          console.log('\n📊 Response Stats:');
          console.log(`📏 Response length: ${result.choices[0].message.content.length} characters`);
          console.log('📈 Token Usage:', result.usage);
          
          // Check if response contains both Japanese and Chinese as expected
          const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(result.choices[0].message.content);
          const hasTranslation = result.choices[0].message.content.includes('翻译') || result.choices[0].message.content.includes('翻訳');
          
          console.log(`🈯 Contains Japanese: ${hasJapanese ? '✅' : '❌'}`);
          console.log(`🔤 Contains translation marker: ${hasTranslation ? '✅' : '❌'}`);
        }
      } else {
        console.error('❌ Complex Query Test Failed!');
        console.error('Response Body:', responseBody);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.error('Raw response:', responseBody.substring(0, 500) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error);
});

req.setTimeout(30000);

req.write(data);
req.end();
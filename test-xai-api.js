#!/usr/bin/env node

// Test script for X.AI Grok3-mini API integration
const https = require('https');
require('dotenv').config();

const XAI_API_KEY = process.env.XAI_API_KEY;

if (!XAI_API_KEY) {
  console.error('❌ XAI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 XAI_API_KEY found:', XAI_API_KEY.substring(0, 10) + '...');

// Test request payload
const testPayload = {
  model: "grok-3-mini",
  messages: [
    {
      role: "system",
      content: "你是上海扑克俱乐部的AI助手小沪。请用简体中文回答用户的问题。"
    },
    {
      role: "user", 
      content: "你好，请介绍一下你自己"
    }
  ],
  stream: false,
  max_tokens: 8000,
  temperature: 0.7,
  top_p: 0.9
};

const data = JSON.stringify(testPayload);

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

console.log('🚀 Testing X.AI Grok3-mini API...');
console.log('📤 Request payload:', JSON.stringify(testPayload, null, 2));

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let responseBody = '';
  
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const result = JSON.parse(responseBody);
        console.log('✅ API Test Successful!');
        console.log('📥 Full Response:', JSON.stringify(result, null, 2));
        
        if (result.choices && result.choices[0] && result.choices[0].message) {
          console.log('\n🤖 AI Response:');
          console.log(result.choices[0].message.content);
          console.log('\n📈 Token Usage:', result.usage);
        }
      } else {
        console.error('❌ API Test Failed!');
        console.error('Response Body:', responseBody);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.error('Raw response:', responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error);
});

req.on('timeout', () => {
  console.error('❌ Request Timeout');
  req.destroy();
});

req.setTimeout(30000); // 30 second timeout

req.write(data);
req.end();
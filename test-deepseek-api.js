/**
 * Test script for DeepSeek-R1 API through SiliconFlow
 * This script tests direct API calls to diagnose issues
 */

require('dotenv').config();

async function testDeepSeekAPI() {
  console.log('🤖 Testing DeepSeek-R1 API through SiliconFlow...\n');
  
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    console.error('❌ SILICONFLOW_API_KEY not found in environment variables');
    return;
  }
  
  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
  
  // Test configurations
  const tests = [
    {
      name: 'Basic Test',
      messages: [
        { role: 'system', content: '你是一个友好的助手。' },
        { role: 'user', content: '你好，请简单介绍一下自己。' }
      ],
      max_tokens: 200,
      temperature: 0.7
    },
    {
      name: 'Extended Response Test',
      messages: [
        { role: 'system', content: '你是一个专业的扑克俱乐部助手。' },
        { role: 'user', content: '请详细解释德州扑克的基本规则。' }
      ],
      max_tokens: 1000,
      temperature: 0.7
    },
    {
      name: 'Reasoning Test',
      messages: [
        { role: 'system', content: '你是一个智能助手，请展示你的推理能力。' },
        { role: 'user', content: '如果今天是星期三，那么3天后是星期几？请解释你的推理过程。' }
      ],
      max_tokens: 500,
      temperature: 0.7
    }
  ];

  for (const test of tests) {
    console.log(`\n📝 Running: ${test.name}`);
    console.log('━'.repeat(50));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
          messages: test.messages,
          stream: false,
          max_tokens: test.max_tokens,
          temperature: test.temperature
        })
      });

      const responseTime = Date.now() - startTime;
      console.log(`⏱️  Response time: ${responseTime}ms`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      
      // Check response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ Invalid response structure:', JSON.stringify(data, null, 2));
        continue;
      }
      
      const content = data.choices[0].message.content;
      console.log(`✅ Success! Response length: ${content.length} characters`);
      console.log(`📊 Usage: ${JSON.stringify(data.usage || {})}`);
      
      // Display response preview
      console.log('\n📄 Response preview:');
      console.log('─'.repeat(50));
      
      // Check for reasoning markers
      if (content.includes('<think>') || content.includes('推理过程：')) {
        console.log('⚠️  Found reasoning markers in response');
        
        // Clean reasoning markers
        const cleaned = content
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace(/推理过程：[\s\S]*?(?=回复：|答案：|$)/g, '')
          .trim();
        
        console.log('🧹 Cleaned response:');
        console.log(cleaned.substring(0, 300) + (cleaned.length > 300 ? '...' : ''));
      } else {
        console.log(content.substring(0, 300) + (content.length > 300 ? '...' : ''));
      }
      
    } catch (error) {
      console.error(`❌ Request failed: ${error.message}`);
    }
  }

  // Test streaming mode
  console.log('\n\n🔄 Testing Streaming Mode...');
  console.log('━'.repeat(50));
  
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: [
          { role: 'system', content: '你是一个友好的助手。' },
          { role: 'user', content: '请用一句话回答：什么是扑克？' }
        ],
        stream: true,
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Streaming Error (${response.status}): ${errorText}`);
    } else {
      console.log('✅ Streaming response received');
      console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
      
      // Read first few chunks
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunks = 0;
      
      while (chunks < 5) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log(`Chunk ${++chunks}:`, chunk.substring(0, 100) + '...');
      }
      
      reader.cancel();
    }
  } catch (error) {
    console.error(`❌ Streaming test failed: ${error.message}`);
  }

  // Summary and recommendations
  console.log('\n\n📊 Test Summary and Recommendations:');
  console.log('━'.repeat(50));
  console.log('1. If seeing frequent timeouts, consider:');
  console.log('   - Reducing max_tokens to 1000 or less');
  console.log('   - Implementing streaming responses');
  console.log('   - Adding timeout handling (30-60 seconds)');
  console.log('\n2. If seeing reasoning markers in output:');
  console.log('   - Implement proper filtering for <think> tags');
  console.log('   - Filter Chinese reasoning markers (推理过程：, 思考过程：)');
  console.log('\n3. For production stability:');
  console.log('   - Add retry logic with exponential backoff');
  console.log('   - Implement proper error handling');
  console.log('   - Consider fallback responses for failures');
  console.log('   - Monitor API usage and rate limits');
}

// Run the test
if (require.main === module) {
  testDeepSeekAPI()
    .then(() => {
      console.log('\n✅ Test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDeepSeekAPI };
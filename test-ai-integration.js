/**
 * Test Script for Silicon Flow AI Integration
 * This script tests the AI chat functionality and Silicon Flow API configuration
 */

require('dotenv').config();

// Use Node.js built-in fetch (Node 18+) or require a polyfill
const fetch = globalThis.fetch || require('node-fetch');

async function testAIIntegration() {
  console.log('🤖 Testing Silicon Flow AI Integration...\n');
  
  const results = {
    envConfig: false,
    chatAPI: false,
    aiPersonaAPI: false,
    fallbackMode: false
  };

  // 1. Test Environment Configuration
  console.log('1️⃣ Checking AI Environment Configuration:');
  const aiConfig = {
    SILICONFLOW_API_KEY: !!process.env.SILICONFLOW_API_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL
  };
  
  Object.entries(aiConfig).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? 'SET' : 'NOT SET'}`);
  });
  
  results.envConfig = aiConfig.SILICONFLOW_API_KEY || aiConfig.OPENAI_API_KEY;
  console.log(`   ${results.envConfig ? '✅' : '❌'} AI Service: ${results.envConfig ? 'CONFIGURED' : 'NOT CONFIGURED'}`);

  // 2. Test Chat API (Simple)
  console.log('\n2️⃣ Testing Chat API (Simple Mode):');
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/chat-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, can you help me with tournaments?',
        history: [],
        clubId: 'demo',
        locale: 'en',
        userId: null
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Simple Chat API: Working`);
      console.log(`   📝 Response: ${data.reply ? data.reply.substring(0, 100) + '...' : 'No reply'}`);
      results.chatAPI = true;
    } else {
      console.log(`   ❌ Simple Chat API: Failed (${response.status})`);
    }
  } catch (error) {
    console.log(`   ❌ Simple Chat API: Error - ${error.message}`);
  }

  // 3. Test Advanced Chat API
  console.log('\n3️⃣ Testing Advanced Chat API:');
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What tournaments are available?',
        history: [],
        clubId: 'demo',
        locale: 'en',
        userId: null
      })
    });
    
    if (response.ok) {
      // Check if it's a streaming response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/plain')) {
        console.log(`   ✅ Advanced Chat API: Streaming mode active`);
        console.log(`   🔄 AI Provider: ${process.env.OPENAI_API_KEY ? 'OpenAI' : 'Fallback mode'}`);
      } else {
        const data = await response.json();
        console.log(`   ✅ Advanced Chat API: JSON response mode`);
        console.log(`   📝 Response: ${JSON.stringify(data).substring(0, 100)}...`);
      }
      results.fallbackMode = !process.env.OPENAI_API_KEY;
    } else {
      console.log(`   ❌ Advanced Chat API: Failed (${response.status})`);
    }
  } catch (error) {
    console.log(`   ❌ Advanced Chat API: Error - ${error.message}`);
  }

  // 4. Test AI Persona API
  console.log('\n4️⃣ Testing AI Persona Configuration:');
  try {
    // This would require authentication, so we'll just test the endpoint exists
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/demo/ai-persona`);
    
    if (response.status === 401) {
      console.log(`   ✅ AI Persona API: Endpoint exists (requires authentication)`);
      results.aiPersonaAPI = true;
    } else if (response.ok) {
      console.log(`   ✅ AI Persona API: Working`);
      results.aiPersonaAPI = true;
    } else {
      console.log(`   ❌ AI Persona API: Unexpected response (${response.status})`);
    }
  } catch (error) {
    console.log(`   ❌ AI Persona API: Error - ${error.message}`);
  }

  // 5. Test AI Tools
  console.log('\n5️⃣ Testing AI Tools Configuration:');
  try {
    const aiToolsPath = './lib/ai-tools/index.ts';
    const fs = require('fs');
    
    if (fs.existsSync(aiToolsPath)) {
      const toolsContent = fs.readFileSync(aiToolsPath, 'utf8');
      const toolMatches = toolsContent.match(/export const \w+APITool/g);
      const toolCount = toolMatches ? toolMatches.length : 0;
      console.log(`   ✅ AI Tools: ${toolCount} tools configured`);
      
      // List available tools
      if (toolMatches) {
        console.log(`   🔧 Available tools:`);
        toolMatches.forEach(match => {
          const toolName = match.replace('export const ', '').replace('APITool', '');
          console.log(`      - ${toolName}`);
        });
      }
    } else {
      console.log(`   ❌ AI Tools: Configuration file not found`);
    }
  } catch (error) {
    console.log(`   ❌ AI Tools: Error reading configuration - ${error.message}`);
  }

  // Summary
  console.log('\n📊 AI Integration Test Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment Config:     ${results.envConfig ? '✅ Configured' : '❌ Missing'}`);
  console.log(`Chat API (Simple):      ${results.chatAPI ? '✅ Working' : '❌ Failed'}`);
  console.log(`AI Persona API:         ${results.aiPersonaAPI ? '✅ Available' : '❌ Failed'}`);
  console.log(`AI Service Mode:        ${results.fallbackMode ? '⚠️  Fallback' : '✅ Full AI'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Configuration Analysis
  console.log('\n🔍 Configuration Analysis:');
  
  if (process.env.SILICONFLOW_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log('⚠️  ISSUE: SiliconFlow API key is set, but the code is using OpenAI SDK');
    console.log('💡 RECOMMENDATION: Update the chat API to use SiliconFlow endpoints');
    console.log('📝 Current implementation expects OPENAI_API_KEY for full AI functionality');
  } else if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API key configured - full AI functionality available');
  } else {
    console.log('⚠️  No AI API keys configured - running in fallback mode only');
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('1. To use SiliconFlow: Update /app/api/chat/route.ts to use SiliconFlow endpoints');
  console.log('2. To use OpenAI: Set OPENAI_API_KEY environment variable');
  console.log('3. For development: Simple chat mode provides basic functionality without AI APIs');
  console.log('4. Test AI persona configuration in the /settings/ai page after authentication');

  return {
    ...results,
    configured: Object.values(results).some(v => v),
    recommendation: process.env.SILICONFLOW_API_KEY && !process.env.OPENAI_API_KEY ? 
      'UPDATE_TO_SILICONFLOW' : 
      process.env.OPENAI_API_KEY ? 'FULLY_CONFIGURED' : 'NEEDS_CONFIGURATION'
  };
}

// Run the test
if (require.main === module) {
  testAIIntegration()
    .then(results => {
      console.log('\n🎯 Test completed successfully!');
      process.exit(results.configured ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testAIIntegration };
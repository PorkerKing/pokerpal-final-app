import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('=== Testing Backup API Logic ===');
    
    // 检查API密钥配置
    const hasValidXAI = process.env.XAI_API_KEY && process.env.XAI_API_KEY !== "请替换为新的X.AI API密钥";
    const hasBackupXAI = process.env.XAI_BACKUP_API_KEY && process.env.XAI_BACKUP_API_KEY !== "请替换为新的X.AI API密钥";
    
    console.log('Primary XAI API available:', hasValidXAI);
    console.log('Backup XAI API available:', hasBackupXAI);
    console.log('Primary API key first 10 chars:', process.env.XAI_API_KEY?.substring(0, 10));
    console.log('Backup API key first 10 chars:', process.env.XAI_BACKUP_API_KEY?.substring(0, 10));
    
    // 测试备用API
    if (hasBackupXAI) {
      console.log('Testing backup X.AI API...');
      
      const testRequest = {
        model: "grok-3-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Say 'Backup API is working!' in response"
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      };
      
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.XAI_BACKUP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRequest)
      });
      
      const responseText = await response.text();
      console.log('Backup API response status:', response.status);
      console.log('Backup API response:', responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        return NextResponse.json({
          success: true,
          message: 'Backup API is working',
          response: data.choices[0]?.message?.content || 'No content',
          debug: {
            hasValidXAI,
            hasBackupXAI,
            status: response.status,
            model: data.model
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: `Backup API error: ${response.status}`,
          details: responseText,
          debug: {
            hasValidXAI,
            hasBackupXAI,
            status: response.status
          }
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'No backup API key configured',
        debug: {
          hasValidXAI,
          hasBackupXAI
        }
      });
    }
    
  } catch (error) {
    console.error('Test backup API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal error',
      details: (error as any).message,
      stack: (error as any).stack
    });
  }
}

export const dynamic = 'force-dynamic';
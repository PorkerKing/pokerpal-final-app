import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log('=== Chat Debug ===');
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('XAI_API_KEY exists:', !!process.env.XAI_API_KEY);
    console.log('XAI_API_KEY length:', process.env.XAI_API_KEY?.length);
    console.log('XAI_API_KEY first 10 chars:', process.env.XAI_API_KEY?.substring(0, 10));
    
    // 测试简单的API调用
    const testRequest = {
      model: "grok-3-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say 'Hello, API is working!' in response"
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    };
    
    console.log('Sending request to X.AI...');
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      return NextResponse.json({
        success: true,
        message: 'API is working',
        response: data.choices[0]?.message?.content || 'No content',
        debug: {
          status: response.status,
          model: data.model
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `API error: ${response.status}`,
        details: responseText,
        debug: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    }
    
  } catch (error) {
    console.error('Test chat debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal error',
      details: (error as any).message,
      stack: (error as any).stack
    });
  }
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'XAI_API_KEY not found',
        available: false 
      });
    }

    // 简单测试请求
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          {
            role: "user", 
            content: "Hello, say 'API key works' in response"
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `X.AI API error: ${response.status}`,
        details: errorText,
        apiKey: apiKey ? 'configured' : 'missing'
      });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      response: data.choices[0]?.message?.content || 'No content',
      apiKey: 'working'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: (error as any).message,
      apiKey: process.env.XAI_API_KEY ? 'configured' : 'missing'
    });
  }
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 检查环境变量是否存在
    if (!process.env.SILICONFLOW_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'SILICONFLOW_API_KEY not configured',
        hasKey: false
      });
    }

    // 测试简单的API调用
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: [
          {
            role: "user",
            content: "简短回复：你好"
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status}`,
        details: errorText,
        hasKey: true
      });
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || 'No response';

    // 清理DeepSeek-R1的推理标签
    if (aiResponse.includes('<think>')) {
      aiResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      hasKey: true,
      model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"
    });

  } catch (error) {
    console.error('Test AI Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.SILICONFLOW_API_KEY
    });
  }
}
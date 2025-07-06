import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { 
  aiToolsAPI
} from '@/lib/ai-tools';
import { getDefaultClubByLocale } from '@/lib/defaultClubs';

export const dynamic = 'force-dynamic';

// 定义哪些工具需要认证
const AUTH_REQUIRED_TOOLS = [
  'tournamentRegister', 
  'getUserClubInfo', 
  'createTournament',
  'getDashboardSummary',
  'listMembers',
  'guidedTournamentCreation',
  'guidedTournamentRegistration',
  'smartTaskWizard'
];

// 访客可用的工具
const GUEST_TOOLS = ['listTournaments', 'getClubStats', 'listRingGames'];

// API配置
const API_CONFIG = {
  timeout: 30000, // 30秒超时
  maxRetries: 3,
  retryDelay: 1000,
  streamTimeout: 60000, // 流式响应60秒超时
  maxTokens: {
    default: 1000,
    extended: 2000,
    streaming: 500
  }
};

// 创建带超时的fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = API_CONFIG.timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// 重试逻辑
async function fetchWithRetry(url: string, options: RequestInit, retries = API_CONFIG.maxRetries): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      
      // 如果是429错误（速率限制），等待更长时间后重试
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : (i + 1) * API_CONFIG.retryDelay * 2;
        console.log(`Rate limited, retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, (i + 1) * API_CONFIG.retryDelay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// 清理DeepSeek-R1的推理输出
function cleanDeepSeekResponse(content: string): string {
  if (!content) return '';
  
  // 移除<think>标签及其内容
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // 移除各种推理标记
  const reasoningMarkers = [
    /推理过程：[\s\S]*?(?=回复：|答案：|回答：|$)/g,
    /思考过程：[\s\S]*?(?=回复：|答案：|回答：|$)/g,
    /分析：[\s\S]*?(?=回复：|答案：|回答：|$)/g,
    /Let me think[\s\S]*?(?=Based on|Answer:|Response:|$)/gi,
    /Reasoning:[\s\S]*?(?=Answer:|Response:|$)/gi
  ];
  
  for (const marker of reasoningMarkers) {
    cleaned = cleaned.replace(marker, '').trim();
  }
  
  // 如果清理后内容过短或为空，尝试提取有效内容
  if (cleaned.length < 10) {
    // 查找可能的回答标记后的内容
    const answerMarkers = ['回复：', '答案：', '回答：', 'Answer:', 'Response:'];
    for (const marker of answerMarkers) {
      const index = content.indexOf(marker);
      if (index !== -1) {
        cleaned = content.substring(index + marker.length).trim();
        if (cleaned.length > 10) break;
      }
    }
  }
  
  // 如果还是太短，返回原始内容的最后部分
  if (cleaned.length < 10 && content.length > 50) {
    const lines = content.split('\n').filter(line => line.trim());
    cleaned = lines.slice(-5).join('\n').trim();
  }
  
  return cleaned || content; // 确保不返回空字符串
}

const getLanguageName = (locale: string): string => {
  switch (locale) {
    case 'zh': return '简体中文';
    case 'zh-TW': return '繁體中文';
    case 'ja': return '日本語';
    case 'en': return 'English';
    default: return '简体中文';
  }
};

// 构建系统提示（保持原有逻辑）
async function buildSystemPrompt(
  clubId: string,
  clubName: string, 
  aiPersonaName: string, 
  locale: string, 
  isGuest: boolean,
  combinedHistory: Array<{role: string, content: string}> = [],
  aiNativeLanguage?: string
): Promise<string> {
  // ... 保持原有的buildSystemPrompt函数内容不变 ...
  // （这里省略了原有的长函数内容，实际使用时需要复制原文件的内容）
  return ''; // placeholder
}

// 转换消息格式
function convertToCoreMessages(
  message: string, 
  history: Array<{role: string, content: string}>,
  systemPrompt: string
): Array<{role: string, content: string}> {
  const coreMessages: Array<{role: string, content: string}> = [
    { role: 'system', content: systemPrompt }
  ];
  
  // 添加历史消息
  history.forEach(msg => {
    coreMessages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    });
  });
  
  // 添加当前消息
  coreMessages.push({
    role: 'user',
    content: message
  });
  
  return coreMessages;
}

// 流式响应处理
async function handleStreamingResponse(response: Response, locale: string): Promise<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  
  if (!reader) {
    throw new Error('No response body');
  }
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
            }
          } catch (e) {
            console.error('Failed to parse streaming chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return cleanDeepSeekResponse(fullContent);
}

export async function POST(req: Request) {
  let locale = 'zh'; // 默认语言
  
  try {
    const body = await req.json();
    const { message, history, clubId, userId, conversationId } = body;
    locale = body.locale || 'zh';
    
    // 获取会话信息
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;
    const actualUserId = userId || (session as any)?.user?.id;
    
    // 处理降级模式 - 当SiliconFlow API不可用时
    if (!process.env.SILICONFLOW_API_KEY) {
      console.log('SiliconFlow API key not configured, using fallback response');
      
      const fallbackResponses = {
        'zh': '很抱歉，AI服务暂时不可用。不过我可以为您提供一些基本信息。',
        'zh-TW': '很抱歉，AI服務暫時不可用。不過我可以為您提供一些基本資訊。',
        'en': 'Sorry, AI service is temporarily unavailable. However, I can provide some basic information.',
        'ja': '申し訳ございませんが、AIサービスは一時的に利用できません。'
      };

      return NextResponse.json({
        success: true,
        reply: fallbackResponses[locale as keyof typeof fallbackResponses] || fallbackResponses['zh'],
        type: 'text'
      });
    }

    // 获取用户的历史对话上下文（最近5条消息）
    let userHistory: Array<{role: string, content: string}> = [];
    if (actualUserId && conversationId && conversationId !== 'default') {
      try {
        const recentMessages = await prisma.chatMessage.findMany({
          where: {
            userId: actualUserId,
            clubId: clubId,
            metadata: {
              path: ['conversationId'],
              equals: conversationId
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            role: true,
            content: true
          }
        });
        
        userHistory = recentMessages.reverse().map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      } catch (error) {
        console.error('获取历史对话失败:', error);
      }
    }
    
    // 合并历史
    const combinedHistory = [...userHistory, ...(history || [])];

    // 获取俱乐部信息
    let clubName = '演示俱乐部';
    let aiPersonaName = 'AI助手';
    
    // ... 保持原有的俱乐部信息获取逻辑 ...

    // 构建系统提示
    const aiNativeLanguage = (globalThis as any).aiNativeLanguage;
    const systemPrompt = await buildSystemPrompt(
      clubId, 
      clubName, 
      aiPersonaName, 
      locale, 
      !isAuthenticated,
      combinedHistory,
      aiNativeLanguage
    );

    // 转换消息格式
    const coreMessages = convertToCoreMessages(message, combinedHistory, systemPrompt);

    // 根据消息长度决定是否使用流式响应
    const totalLength = coreMessages.reduce((sum, msg) => sum + msg.content.length, 0);
    const useStreaming = totalLength > 1000;
    const maxTokens = useStreaming ? API_CONFIG.maxTokens.streaming : 
                     (totalLength > 500 ? API_CONFIG.maxTokens.extended : API_CONFIG.maxTokens.default);

    // 准备API请求
    const siliconflowRequest = {
      model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
      messages: coreMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream: useStreaming,
      max_tokens: maxTokens,
      temperature: 0.7
    };

    console.log(`Making API request: streaming=${useStreaming}, max_tokens=${maxTokens}`);

    // 调用API
    const response = await fetchWithRetry('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(siliconflowRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`SiliconFlow API error: ${response.status}`);
    }

    let aiResponse: string;
    
    if (useStreaming) {
      aiResponse = await handleStreamingResponse(response, locale);
    } else {
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response:', JSON.stringify(data, null, 2));
        throw new Error('Invalid API response structure');
      }
      
      aiResponse = cleanDeepSeekResponse(data.choices[0].message.content);
      
      // 记录使用情况
      if (data.usage) {
        console.log(`Token usage: ${JSON.stringify(data.usage)}`);
      }
    }
    
    // 确保响应不为空
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.warn('Empty AI response, using fallback');
      const fallbackMessages = {
        'zh': '抱歉，我需要更多时间来思考这个问题。请稍后再试。',
        'zh-TW': '抱歉，我需要更多時間來思考這個問題。請稍後再試。',
        'en': 'Sorry, I need more time to process this. Please try again later.',
        'ja': '申し訳ございませんが、もう少し時間が必要です。後でもう一度お試しください。'
      };
      aiResponse = fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages['zh'];
    }

    // 保存对话历史
    if (actualUserId && conversationId) {
      try {
        await prisma.$transaction([
          prisma.chatMessage.create({
            data: {
              userId: actualUserId,
              clubId: clubId,
              role: 'user',
              content: message,
              metadata: { locale, conversationId }
            }
          }),
          prisma.chatMessage.create({
            data: {
              userId: actualUserId,
              clubId: clubId,
              role: 'assistant',
              content: aiResponse,
              metadata: { 
                locale, 
                conversationId, 
                model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
                streaming: useStreaming,
                tokens: maxTokens
              }
            }
          })
        ]);
      } catch (error) {
        console.error('保存对话历史失败:', error);
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      type: 'text',
      conversationId: conversationId || 'default'
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // 根据错误类型提供更具体的错误消息
    const errorMessages = {
      'zh': {
        timeout: '抱歉，AI响应超时。请尝试简化您的问题或稍后再试。',
        apiKey: '抱歉，AI服务配置有误。请联系管理员检查API密钥设置。',
        rateLimit: '抱歉，请求过于频繁。请稍等片刻再试。',
        general: '抱歉，聊天服务暂时不可用，请稍后再试。'
      },
      'zh-TW': {
        timeout: '抱歉，AI響應超時。請嘗試簡化您的問題或稍後再試。',
        apiKey: '抱歉，AI服務配置有誤。請聯繫管理員檢查API金鑰設定。',
        rateLimit: '抱歉，請求過於頻繁。請稍等片刻再試。',
        general: '抱歉，聊天服務暫時不可用，請稍後再試。'
      },
      'en': {
        timeout: 'Sorry, AI response timed out. Please try simplifying your question or try again later.',
        apiKey: 'Sorry, AI service configuration error. Please contact administrator.',
        rateLimit: 'Sorry, too many requests. Please wait a moment and try again.',
        general: 'Sorry, chat service is temporarily unavailable. Please try again later.'
      },
      'ja': {
        timeout: '申し訳ございませんが、AI応答がタイムアウトしました。質問を簡略化するか、後でもう一度お試しください。',
        apiKey: '申し訳ございませんが、AIサービスの設定にエラーがあります。',
        rateLimit: '申し訳ございませんが、リクエストが多すぎます。しばらくお待ちください。',
        general: '申し訳ございませんが、チャットサービスは一時的に利用できません。'
      }
    };
    
    const messages = errorMessages[locale as keyof typeof errorMessages] || errorMessages['zh'];
    let fallbackMessage = messages.general;
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        fallbackMessage = messages.timeout;
      } else if (error.message.includes('API key')) {
        fallbackMessage = messages.apiKey;
      } else if (error.message.includes('429')) {
        fallbackMessage = messages.rateLimit;
      }
    }

    return NextResponse.json({
      success: true,
      reply: fallbackMessage,
      type: 'text'
    });
  }
}
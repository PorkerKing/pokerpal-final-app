import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { streamText, CoreMessage, CoreTool } from "ai";
import { NextResponse } from 'next/server';
import { 
  aiToolsAPI
} from '@/lib/ai-tools';

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

const getLanguageName = (locale: string): string => {
  switch (locale) {
    case 'zh': return '简体中文';
    case 'zh-TW': return '繁體中文';
    case 'ja': return '日本語';
    case 'en': return 'English';
    default: return '简体中文';
  }
};

// 构建系统提示
async function buildSystemPrompt(
  clubId: string,
  clubName: string, 
  aiPersonaName: string, 
  locale: string, 
  isGuest: boolean
): Promise<string> {
  // 尝试获取自定义AI设置
  let aiPersona = null;
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    aiPersona = await prisma.aIPersona.findUnique({
      where: { clubId: clubId }
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error('获取AI设置失败:', error);
  }

  // 使用自定义设置或默认设置
  const defaultStyle = {
    tone: 'friendly',
    language: 'zh',
    emoji: true,
    verbosity: 'detailed'
  };
  
  const style = (aiPersona?.style as any) || defaultStyle;

  const language = getLanguageName(style.language || locale);
  const customName = aiPersona?.name || aiPersonaName;
  
  // 根据风格调整提示词
  const toneOptions = {
    'professional': '保持专业、正式的语调',
    'friendly': '使用友好、亲切的语调',
    'casual': '采用轻松、随意的交流方式',
    'formal': '维持严肃、正经的沟通风格'
  };
  const toneStyle = toneOptions[style.tone as keyof typeof toneOptions] || '使用友好、亲切的语调';

  const verbosityOptions = {
    'concise': '回答简洁明了，直击要点',
    'detailed': '提供详细说明和必要的背景信息',
    'comprehensive': '给出全面详尽的解答和相关建议'
  };
  const verbosityStyle = verbosityOptions[style.verbosity as keyof typeof verbosityOptions] || '提供详细说明和必要的背景信息';

  const emojiUsage = style.emoji ? '适当使用表情符号让对话更生动' : '不使用表情符号，保持纯文本交流';

  const basePrompt = aiPersona?.systemPrompt || `你是${clubName}的专属AI助手${customName}。请使用${language}回答所有问题。

个性特征：
${aiPersona?.personality || '我是一个专业、友好的扑克俱乐部助手。我了解扑克规则，能够帮助用户报名参加锦标赛，查询战绩，并提供各种俱乐部服务。我总是礼貌耐心，用简洁明了的语言回答问题。'}

交流风格：
- ${toneStyle}
- ${verbosityStyle}
- ${emojiUsage}

核心职责：
- 帮助用户了解俱乐部信息和服务
- 协助锦标赛报名和查询
- 提供圆桌游戏信息
- 解答俱乐部相关问题`;
  
  if (isGuest) {
    return `${basePrompt}
    
用户当前是访客身份。你可以：
- 介绍俱乐部和服务
- 查看锦标赛列表 (listTournaments)
- 查看圆桌游戏信息 (listRingGames)
- 获取俱乐部统计信息 (getClubStats)
- 回答一般性问题

对于需要登录的功能（如报名、创建锦标赛、查看会员列表等），请友好地引导用户登录：
"这个功能需要登录才能使用。登录后您可以查看仪表盘数据、报名比赛、创建锦标赛等。请点击右上角的登录按钮。"`;
  }
  
  return `${basePrompt}
  
用户已登录，您具有完整的功能权限。您可以：

📊 **仪表盘和统计**：
- 获取俱乐部运营概览 (getDashboardSummary)
- 查看详细统计数据 (getClubStats)

🏆 **锦标赛管理**：
- 查看锦标赛列表 (listTournaments)
- 创建新锦标赛 (createTournament)
- 引导式锦标赛创建 (guidedTournamentCreation) - 逐步指导管理者创建锦标赛
- 为用户报名锦标赛 (tournamentRegister)
- 引导式报名流程 (guidedTournamentRegistration) - 帮助用户找到并报名合适的锦标赛

🎮 **圆桌游戏**：
- 查看圆桌游戏列表 (listRingGames)
- 获取牌桌状态和玩家信息

👥 **会员管理**：
- 查看会员列表 (listMembers)
- 获取用户在俱乐部的详细信息 (getUserClubInfo)

🎯 **智能任务向导**：
- 智能任务引导 (smartTaskWizard) - 根据用户角色提供个性化的任务指导

**AI引导服务**：
- 对于复杂任务，主动使用引导式工具提供逐步指导
- 根据用户角色（OWNER、ADMIN、MANAGER、MEMBER等）提供个性化服务
- 识别用户意图，主动推荐合适的操作流程

请根据用户的问题智能选择合适的工具。当用户询问"如何创建锦标赛"时，使用guidedTournamentCreation；当用户想要报名时，使用guidedTournamentRegistration；当用户需要任务指导时，使用smartTaskWizard。`;
}

// 转换消息格式
function convertToCoreMessages(
  message: string, 
  history: Array<{role: string, content: string}>,
  systemPrompt: string
): CoreMessage[] {
  const coreMessages: CoreMessage[] = [
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

export async function POST(req: Request) {
  try {
    const { message, history, clubId, locale, userId } = await req.json();
    
    // 获取会话信息
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;
    const actualUserId = userId || (session as any)?.user?.id;

    // 处理降级模式 - 当OpenAI API不可用时
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured, using fallback response');
      
      const fallbackResponses = {
        'zh': [
          '很抱歉，AI服务暂时不可用。不过我可以为您提供一些基本信息：',
          '目前我们的AI聊天功能正在维护中，但您仍然可以使用其他功能。',
          '感谢您的耐心等待，我们正在努力恢复AI助手服务。'
        ],
        'en': [
          'Sorry, AI service is temporarily unavailable. However, I can provide some basic information:',
          'Our AI chat feature is currently under maintenance, but you can still use other features.',
          'Thank you for your patience, we are working to restore the AI assistant service.'
        ]
      };

      const responses = fallbackResponses[locale as keyof typeof fallbackResponses] || fallbackResponses['zh'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      return NextResponse.json({
        success: true,
        reply: randomResponse,
        type: 'text'
      });
    }

    // 获取俱乐部信息用于构建系统提示
    let clubName = '演示俱乐部';
    let aiPersonaName = 'AI助手';
    
    try {
      if (clubId && clubId !== 'guest' && clubId !== 'demo' && clubId !== 'fallback' && clubId !== 'error') {
        const club = await prisma.club.findUnique({
          where: { id: clubId },
          include: {
            aiPersona: {
              select: { name: true }
            }
          }
        });
        
        if (club) {
          clubName = club.name;
          aiPersonaName = club.aiPersona?.name || 'AI助手';
        }
      }
    } catch (error) {
      console.error('获取俱乐部信息失败:', error);
    }

    // 构建系统提示
    const systemPrompt = await buildSystemPrompt(
      clubId, 
      clubName, 
      aiPersonaName, 
      locale, 
      !isAuthenticated
    );

    // 转换消息格式
    const coreMessages = convertToCoreMessages(message, history, systemPrompt);

    // 获取可用工具
    const availableTools = isAuthenticated ? aiToolsAPI : 
      Object.fromEntries(Object.entries(aiToolsAPI).filter(([key]) => GUEST_TOOLS.includes(key)));

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: coreMessages,
      tools: availableTools,
      async onFinish({ text }) {
        // 可以在这里保存对话历史
        console.log('AI Response:', text);
      },
    });

    return result.toAIStreamResponse();

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // 提供降级响应
    const fallbackMessage = error instanceof Error && error.message.includes('API key') ?
      '抱歉，AI服务配置有误。请联系管理员检查API密钥设置。' :
      '抱歉，聊天服务暂时不可用，请稍后再试。';

    return NextResponse.json({
      success: true,
      reply: fallbackMessage,
      type: 'text'
    });
  }
}
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
  'listMembers'
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
function buildSystemPrompt(
  clubName: string, 
  aiPersonaName: string, 
  locale: string, 
  isGuest: boolean
): string {
  const language = getLanguageName(locale);
  const basePrompt = `你是${clubName}的专属AI助手${aiPersonaName}。请使用${language}回答所有问题。`;
  
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
- 为用户报名锦标赛 (tournamentRegister)

🎮 **圆桌游戏**：
- 查看圆桌游戏列表 (listRingGames)
- 获取牌桌状态和玩家信息

👥 **会员管理**：
- 查看会员列表 (listMembers)
- 获取用户在俱乐部的详细信息 (getUserClubInfo)

请根据用户的问题智能选择合适的工具。如果用户询问创建或管理相关的问题，主动询问必要的信息并帮助完成操作。`;
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
    const body = await req.json();
    const { message, history = [], clubId, locale = 'zh', userId } = body;
    
    // 验证必需参数
    if (!message || !clubId) {
      return NextResponse.json(
        { error: 'Missing required parameters' }, 
        { status: 400 }
      );
    }
    
    // 获取会话信息
    const session = await getServerSession(authOptions);
    const authenticatedUserId = (session as any)?.user?.id;
    
    // 安全检查：确保客户端传递的 userId 与会话中的 userId 匹配
    const isGuest = !authenticatedUserId;
    const validUserId = (!isGuest && userId === authenticatedUserId) ? userId : null;
    
    // 获取俱乐部和AI角色信息
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: { aiPersona: true }
    });
    
    if (!club || !club.aiPersona) {
      return NextResponse.json(
        { error: 'Club or AI persona not found' }, 
        { status: 404 }
      );
    }
    
    // 构建系统提示
    const systemPrompt = buildSystemPrompt(
      club.name,
      club.aiPersona.name,
      locale,
      isGuest
    );
    
    // 转换消息格式
    const coreMessages = convertToCoreMessages(message, history, systemPrompt);
    
    // 根据用户状态选择可用的工具
    const availableTools = isGuest 
      ? Object.fromEntries(GUEST_TOOLS.map(name => [name, aiToolsAPI[name as keyof typeof aiToolsAPI]]))
      : aiToolsAPI;
    
    // 为需要认证的工具注入用户ID
    const enhancedTools = Object.fromEntries(
      Object.entries(availableTools).map(([name, tool]) => {
        if (AUTH_REQUIRED_TOOLS.includes(name) && !validUserId) {
          // 为访客返回需要登录的提示
          return [name, {
            ...tool,
            execute: async () => '此功能需要登录才能使用。请先登录。'
          }];
        }
        
        return [name, {
          ...tool,
          execute: async (args: any) => {
            // 注入必要的参数
            const enhancedArgs = { ...args };
            if (validUserId && (name === 'tournamentRegister' || name === 'getUserClubInfo')) {
              enhancedArgs.userId = validUserId;
            }
            if (!enhancedArgs.clubId) {
              enhancedArgs.clubId = clubId;
            }
            
            return await tool.execute(enhancedArgs);
          }
        }];
      })
    );
    
    // 使用 streamText 生成响应
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: coreMessages,
      tools: enhancedTools,
      maxTokens: 2000,
      temperature: 0.7,
      async onFinish({ text, toolCalls }) {
        // 可以在这里记录对话历史
        if (validUserId) {
          console.log(`User ${validUserId} sent message in club ${clubId}`);
        }
      },
    });
    
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: 'An unexpected error occurred in chat' }, 
      { status: 500 }
    );
  }
}
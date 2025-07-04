import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

const getLanguageName = (locale: string): string => {
  switch (locale) {
    case 'zh': return '简体中文';
    case 'zh-TW': return '繁體中文';
    case 'ja': return '日本語';
    case 'en': return 'English';
    default: return '简体中文';
  }
};

// 简单的模拟AI响应（当OpenAI不可用时使用）
const generateMockResponse = (message: string, locale: string, clubName: string, aiPersonaName: string, isAuthenticated: boolean) => {
  const responses = {
    'zh': {
      tournament: [
        `好的！我来为您查看一下${clubName}的锦标赛安排。`,
        `${clubName}最近有几个不错的锦标赛，我为您详细介绍一下。`,
        `让我帮您查询一下最新的锦标赛信息！`
      ],
      general: [
        `您好！我是${aiPersonaName}，${clubName}的专属AI助手。很高兴为您服务！`,
        `作为${clubName}的AI助手，我可以帮您查询锦标赛、管理会员信息等。有什么需要帮助的吗？`,
        `欢迎来到${clubName}！我是您的专属助手${aiPersonaName}，随时为您提供服务。`
      ],
      points: [
        `我来帮您查看积分情况！`,
        `让我为您查询一下最新的积分和排名信息。`,
        `积分查询功能马上为您展示！`
      ],
      games: [
        `圆桌游戏是我们俱乐部的特色服务之一！`,
        `我来为您介绍一下当前可用的圆桌游戏。`,
        `现在有几个圆桌游戏正在进行，我为您详细说明。`
      ],
      auth: [
        `这个功能需要登录才能使用哦！登录后您可以查看仪表盘数据、报名比赛、创建锦标赛等。请点击右上角的登录按钮。`,
        `为了更好地为您服务，建议您先登录。登录后可以解锁更多个性化功能！`
      ]
    },
    'en': {
      tournament: [
        `Great! Let me check the tournament schedule for ${clubName}.`,
        `${clubName} has several exciting tournaments coming up. Let me give you the details.`,
        `Let me help you find the latest tournament information!`
      ],
      general: [
        `Hello! I'm ${aiPersonaName}, your dedicated AI assistant for ${clubName}. Happy to help!`,
        `As the AI assistant for ${clubName}, I can help you with tournaments, member management, and more. What can I do for you?`,
        `Welcome to ${clubName}! I'm your dedicated assistant ${aiPersonaName}, ready to serve you.`
      ],
      points: [
        `Let me check your points for you!`,
        `I'll help you view your latest points and ranking information.`,
        `Points query feature coming right up!`
      ],
      games: [
        `Ring games are one of our club's specialty services!`,
        `Let me introduce you to the currently available ring games.`,
        `There are several ring games in progress now, let me explain them in detail.`
      ],
      auth: [
        `This feature requires login to use! After logging in, you can view dashboard data, register for tournaments, create tournaments, etc. Please click the login button in the top right corner.`,
        `To better serve you, I recommend logging in first. After logging in, you can unlock more personalized features!`
      ]
    }
  };

  const lang = locale === 'en' ? 'en' : 'zh';
  const langResponses = responses[lang];

  // 根据消息内容选择合适的响应类型
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('锦标赛') || lowerMessage.includes('tournament') || lowerMessage.includes('比赛')) {
    const responseList = langResponses.tournament;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }
  
  if (lowerMessage.includes('积分') || lowerMessage.includes('points') || lowerMessage.includes('排名') || lowerMessage.includes('ranking')) {
    if (!isAuthenticated) {
      const authList = langResponses.auth;
      return authList[Math.floor(Math.random() * authList.length)];
    }
    const responseList = langResponses.points;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }
  
  if (lowerMessage.includes('圆桌') || lowerMessage.includes('ring') || lowerMessage.includes('cash') || lowerMessage.includes('游戏')) {
    const responseList = langResponses.games;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  // 默认通用响应
  const responseList = langResponses.general;
  return responseList[Math.floor(Math.random() * responseList.length)];
};

export async function POST(req: Request) {
  try {
    const { message, history, clubId, locale, userId } = await req.json();
    
    // 获取会话信息
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;

    // 获取俱乐部信息
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

    // 生成模拟AI响应
    const reply = generateMockResponse(message, locale, clubName, aiPersonaName, isAuthenticated);

    // 检查是否需要认证
    const authRequired = !isAuthenticated && (
      message.includes('报名') || 
      message.includes('创建') || 
      message.includes('管理') ||
      message.includes('register') ||
      message.includes('create') ||
      message.includes('manage')
    );

    if (authRequired) {
      return NextResponse.json({
        success: true,
        authRequired: true,
        message: '此功能需要登录'
      });
    }

    return NextResponse.json({
      success: true,
      reply: reply,
      data: reply,
      message: reply,
      type: 'text'
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    return NextResponse.json({
      success: false,
      error: '聊天服务暂时不可用，请稍后再试。',
      reply: '抱歉，我现在无法回应您的消息。请稍后再试。'
    });
  }
}
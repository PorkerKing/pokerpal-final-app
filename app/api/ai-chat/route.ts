import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// AI 可执行的数据库操作
const ALLOWED_DB_OPERATIONS = {
  // 会员管理
  'create_member': async (params: any, userId: string) => {
    const { name, email, role = 'MEMBER', clubId } = params;
    
    // 验证权限
    const membership = await prisma.clubMember.findFirst({
      where: { userId, clubId, role: { in: ['OWNER', 'ADMIN'] } }
    });
    
    if (!membership) {
      throw new Error('权限不足：只有管理员可以创建会员');
    }

    // 创建用户和会员
    const newUser = await prisma.user.create({
      data: { name, email }
    });

    const newMember = await prisma.clubMember.create({
      data: {
        userId: newUser.id,
        clubId,
        role,
        status: 'ACTIVE'
      }
    });

    return `成功创建会员：${name} (${email})，角色：${role}`;
  },

  // 比赛管理
  'create_tournament': async (params: any, userId: string) => {
    const { name, buyIn, startTime, clubId } = params;
    
    const membership = await prisma.clubMember.findFirst({
      where: { userId, clubId, role: { in: ['OWNER', 'ADMIN', 'MANAGER'] } }
    });
    
    if (!membership) {
      throw new Error('权限不足：只有管理员可以创建比赛');
    }

    // 获取默认的盲注和奖金结构
    const [blindStructure, payoutStructure] = await Promise.all([
      prisma.blindStructure.findFirst({ where: { clubId } }),
      prisma.payoutStructure.findFirst({ where: { clubId } })
    ]);

    if (!blindStructure || !payoutStructure) {
      throw new Error('请先设置盲注结构和奖金结构');
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        clubId,
        buyIn: parseFloat(buyIn),
        fee: parseFloat(buyIn) * 0.1, // 10% 费用
        startTime: new Date(startTime),
        startingStack: 10000,
        blindStructureId: blindStructure.id,
        payoutStructureId: payoutStructure.id,
        status: 'SCHEDULED'
      }
    });

    return `成功创建比赛：${name}，买入：¥${buyIn}，开始时间：${startTime}`;
  },

  // 财务操作
  'add_balance': async (params: any, userId: string) => {
    const { memberEmail, amount, clubId, description = '管理员充值' } = params;
    
    const membership = await prisma.clubMember.findFirst({
      where: { userId, clubId, role: { in: ['OWNER', 'ADMIN', 'RECEPTIONIST'] } }
    });
    
    if (!membership) {
      throw new Error('权限不足：只有管理员可以调整余额');
    }

    // 查找目标会员
    const targetUser = await prisma.user.findUnique({
      where: { email: memberEmail }
    });

    if (!targetUser) {
      throw new Error(`找不到用户：${memberEmail}`);
    }

    const targetMember = await prisma.clubMember.findFirst({
      where: { userId: targetUser.id, clubId }
    });

    if (!targetMember) {
      throw new Error(`用户 ${memberEmail} 不是俱乐部成员`);
    }

    // 更新余额并记录交易
    const newBalance = targetMember.balance.toNumber() + parseFloat(amount);
    
    await prisma.$transaction([
      prisma.clubMember.update({
        where: { id: targetMember.id },
        data: { balance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          userId: targetUser.id,
          clubId,
          type: 'DEPOSIT',
          amount: parseFloat(amount),
          balanceBefore: targetMember.balance,
          balanceAfter: newBalance,
          description
        }
      })
    ]);

    return `成功为 ${memberEmail} 充值 ¥${amount}，当前余额：¥${newBalance.toLocaleString()}`;
  },

  // 查询操作
  'get_member_info': async (params: any, userId: string) => {
    const { email, clubId } = params;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return `找不到用户：${email}`;
    }

    const member = await prisma.clubMember.findFirst({
      where: { userId: user.id, clubId },
      include: { user: true }
    });

    if (!member) {
      return `用户 ${email} 不是俱乐部成员`;
    }

    return `会员信息：
姓名：${user.name}
邮箱：${email}
角色：${member.role}
状态：${member.status}
余额：¥${member.balance.toNumber().toLocaleString()}
加入时间：${member.joinDate.toLocaleDateString('zh-CN')}`;
  }
};

// 解析 AI 指令
function parseAICommand(message: string) {
  // 简单的指令解析逻辑
  const lowerMessage = message.toLowerCase();
  
  // 创建会员
  if (lowerMessage.includes('创建会员') || lowerMessage.includes('添加会员')) {
    const nameMatch = message.match(/姓名[：:]\s*([^\s,，]+)/);
    const emailMatch = message.match(/邮箱[：:]\s*([^\s,，]+)/);
    const roleMatch = message.match(/角色[：:]\s*([^\s,，]+)/);
    
    if (nameMatch && emailMatch) {
      return {
        operation: 'create_member',
        params: {
          name: nameMatch[1],
          email: emailMatch[1],
          role: roleMatch?.[1] || 'MEMBER'
        }
      };
    }
  }
  
  // 创建比赛
  if (lowerMessage.includes('创建比赛') || lowerMessage.includes('新建比赛')) {
    const nameMatch = message.match(/名称[：:]\s*([^\s,，]+)/);
    const buyInMatch = message.match(/买入[：:]\s*([0-9]+)/);
    const timeMatch = message.match(/时间[：:]\s*([^\s,，]+)/);
    
    if (nameMatch && buyInMatch) {
      return {
        operation: 'create_tournament',
        params: {
          name: nameMatch[1],
          buyIn: buyInMatch[1],
          startTime: timeMatch?.[1] || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }
  }
  
  // 充值
  if (lowerMessage.includes('充值') || lowerMessage.includes('加余额')) {
    const emailMatch = message.match(/邮箱[：:]\s*([^\s,，]+)|为\s*([^\s,，]+)\s*充值/);
    const amountMatch = message.match(/([0-9]+)\s*元|充值\s*([0-9]+)/);
    
    if (emailMatch && amountMatch) {
      return {
        operation: 'add_balance',
        params: {
          memberEmail: emailMatch[1] || emailMatch[2],
          amount: amountMatch[1] || amountMatch[2]
        }
      };
    }
  }
  
  // 查询会员信息
  if (lowerMessage.includes('查询') || lowerMessage.includes('会员信息')) {
    const emailMatch = message.match(/邮箱[：:]\s*([^\s,，]+)|查询\s*([^\s,，]+)/);
    
    if (emailMatch) {
      return {
        operation: 'get_member_info',
        params: {
          email: emailMatch[1] || emailMatch[2]
        }
      };
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messages, context } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    // 尝试解析数据库操作指令
    const command = parseAICommand(lastMessage.content);
    
    if (command && ALLOWED_DB_OPERATIONS[command.operation as keyof typeof ALLOWED_DB_OPERATIONS]) {
      try {
        // 添加默认的 clubId（这里应该从用户session或当前选中的俱乐部获取）
        const clubId = 'default-club-id'; // TODO: 从实际数据获取
        (command.params as any).clubId = clubId;
        
        const operation = ALLOWED_DB_OPERATIONS[command.operation as keyof typeof ALLOWED_DB_OPERATIONS];
        const result = await operation(command.params, session.user.id);
        
        return NextResponse.json({
          message: result,
          isDbOperation: true
        });
      } catch (error) {
        console.error('Database operation error:', error);
        return NextResponse.json({
          message: `操作失败：${error instanceof Error ? error.message : '未知错误'}`,
          isDbOperation: true
        });
      }
    }
    
    // 如果不是数据库操作，返回普通的AI响应
    const contextPrompts = {
      members: '你是会员管理助手。可以帮助创建会员、查询会员信息、管理会员权限等。',
      tournaments: '你是比赛管理助手。可以帮助创建比赛、查询比赛信息、管理比赛状态等。',
      finance: '你是财务管理助手。可以帮助查询财务报表、管理会员余额、处理交易记录等。',
      settings: '你是系统设置助手。可以帮助配置俱乐部设置、管理权限、调整系统参数等。',
      general: '你是 PokerPal 智能助手。我可以帮助您管理俱乐部的各项事务。'
    };

    const systemPrompt = contextPrompts[context as keyof typeof contextPrompts] || contextPrompts.general;
    
    // 模拟 AI 响应（实际项目中这里应该调用真正的 AI API）
    const aiResponse = `${systemPrompt}\n\n针对您的问题："${lastMessage.content}"，我建议您可以使用具体的指令格式，例如：\n\n• 创建会员：姓名：张三，邮箱：zhang@example.com，角色：MEMBER\n• 创建比赛：名称：周末锦标赛，买入：100\n• 充值：为 user@example.com 充值 500 元\n• 查询：查询 user@example.com 的会员信息\n\n请告诉我您想要执行什么操作？`;

    return NextResponse.json({
      message: aiResponse,
      isDbOperation: false
    });

  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
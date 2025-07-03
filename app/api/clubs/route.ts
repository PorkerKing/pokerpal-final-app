// API 路由: /api/clubs
// 处理俱乐部的 CRUD 操作

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateRequestBody,
  createSuccessResponse,
  createPaginatedResponse,
  getPaginationParams,
  ApiError
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { Role, MemberStatus } from '@prisma/client';

// GET /api/clubs - 获取俱乐部列表
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // 可选：获取用户参与的俱乐部
  const isActive = searchParams.get('isActive');
  
  const { page, limit, orderBy, orderDir } = getPaginationParams(request);

  // 构建查询条件
  const where: any = {};
  
  if (isActive !== null) {
    where.isActive = isActive === 'true';
  }

  // 如果指定了用户ID，只返回该用户参与的俱乐部
  if (userId) {
    where.members = {
      some: {
        userId,
        status: MemberStatus.ACTIVE
      }
    };
  }

  // 获取总数
  const total = await prisma.club.count({ where });

  // 获取俱乐部列表
  const clubs = await prisma.club.findMany({
    where,
    include: {
      aiPersona: {
        select: { name: true, avatarUrl: true }
      },
      _count: {
        select: { 
          members: {
            where: { status: MemberStatus.ACTIVE }
          },
          tournaments: true,
          ringGameTables: true
        }
      },
      ...(userId && {
        members: {
          where: { userId, status: MemberStatus.ACTIVE },
          select: { role: true, balance: true, joinDate: true, vipLevel: true }
        }
      })
    },
    orderBy: { [orderBy!]: orderDir },
    skip: (page! - 1) * limit!,
    take: limit
  });

  return createPaginatedResponse(clubs, page!, limit!, total);
});

// POST /api/clubs - 创建新俱乐部
export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await validateSession();
  
  const body = await validateRequestBody<{
    name: string;
    description?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    timezone?: string;
    currency?: string;
    settings?: any;
    aiPersona: {
      name: string;
      personality: string;
      systemPrompt?: string;
      avatarUrl?: string;
    };
  }>(request, ['name', 'aiPersona']);

  // 验证俱乐部名称唯一性
  const existingClub = await prisma.club.findUnique({
    where: { name: body.name }
  });

  if (existingClub) {
    throw new ApiError('Club name already exists', 400);
  }

  // 创建俱乐部和AI角色
  const club = await prisma.$transaction(async (tx) => {
    // 创建俱乐部
    const newClub = await tx.club.create({
      data: {
        name: body.name,
        description: body.description,
        logoUrl: body.logoUrl,
        coverImageUrl: body.coverImageUrl,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        timezone: body.timezone || 'UTC',
        currency: body.currency || 'USD',
        settings: body.settings
      }
    });

    // 创建AI角色
    await tx.aIPersona.create({
      data: {
        clubId: newClub.id,
        name: body.aiPersona.name,
        personality: body.aiPersona.personality,
        systemPrompt: body.aiPersona.systemPrompt,
        avatarUrl: body.aiPersona.avatarUrl
      }
    });

    // 将创建者设为俱乐部所有者
    await tx.clubMember.create({
      data: {
        clubId: newClub.id,
        userId: session.user.id,
        role: Role.OWNER,
        status: MemberStatus.ACTIVE,
        balance: 0
      }
    });

    // 创建默认会员等级
    await tx.membershipTier.createMany({
      data: [
        {
          clubId: newClub.id,
          name: '铜牌会员',
          level: 1,
          minPointsRequired: 0,
          minGamesRequired: 0,
          benefits: ['基础聊天功能', '参与锦标赛'],
          color: '#CD7F32'
        },
        {
          clubId: newClub.id,
          name: '银牌会员',
          level: 2,
          minPointsRequired: 1000,
          minGamesRequired: 10,
          benefits: ['优先报名', '专属客服', '月度奖励'],
          color: '#C0C0C0'
        },
        {
          clubId: newClub.id,
          name: '金牌会员',
          level: 3,
          minPointsRequired: 5000,
          minGamesRequired: 50,
          benefits: ['VIP待遇', '定制服务', '专属活动'],
          color: '#FFD700'
        }
      ]
    });

    // 创建默认盲注结构
    await tx.blindStructure.create({
      data: {
        clubId: newClub.id,
        name: '标准锦标赛盲注',
        description: '适用于大多数锦标赛的标准盲注结构',
        levels: [
          { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 15 },
          { level: 2, smallBlind: 15, bigBlind: 30, ante: 0, duration: 15 },
          { level: 3, smallBlind: 25, bigBlind: 50, ante: 0, duration: 15 },
          { level: 4, smallBlind: 50, bigBlind: 100, ante: 0, duration: 15 },
          { level: 5, smallBlind: 75, bigBlind: 150, ante: 0, duration: 15 },
          { level: 6, smallBlind: 100, bigBlind: 200, ante: 25, duration: 15 },
          { level: 7, smallBlind: 150, bigBlind: 300, ante: 25, duration: 15 },
          { level: 8, smallBlind: 200, bigBlind: 400, ante: 50, duration: 15 }
        ]
      }
    });

    // 创建默认支付结构
    await tx.payoutStructure.create({
      data: {
        clubId: newClub.id,
        name: '标准支付结构',
        description: '适用于大多数锦标赛的标准支付比例',
        payouts: [
          { position: 1, percentage: 50 },
          { position: 2, percentage: 30 },
          { position: 3, percentage: 20 }
        ]
      }
    });

    // 创建默认服务费结构
    await tx.serviceFeeStructure.create({
      data: {
        clubId: newClub.id,
        name: '标准服务费',
        percentage: 5.0,
        cap: 10.00
      }
    });

    return newClub;
  });

  // 返回完整的俱乐部信息
  const completeClub = await prisma.club.findUnique({
    where: { id: club.id },
    include: {
      aiPersona: true,
      _count: {
        select: { 
          members: true,
          tournaments: true,
          ringGameTables: true
        }
      }
    }
  });

  return createSuccessResponse(completeClub, 'Club created successfully');
});
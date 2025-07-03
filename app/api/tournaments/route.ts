// API 路由: /api/tournaments
// 处理锦标赛的 CRUD 操作

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  validateRequestBody,
  createSuccessResponse,
  createPaginatedResponse,
  getPaginationParams,
  ApiError,
  formatAmount
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { TournamentStatus, GameType } from '@prisma/client';

// GET /api/tournaments - 获取锦标赛列表
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');
  const status = searchParams.get('status') as TournamentStatus;
  const gameType = searchParams.get('gameType') as GameType;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  if (!clubId) {
    throw new ApiError('Club ID is required', 400);
  }

  const { page, limit, orderBy, orderDir } = getPaginationParams(request);

  // 构建查询条件
  const where: any = { clubId };
  
  if (status) {
    where.status = status;
  }
  
  if (gameType) {
    where.gameType = gameType;
  }
  
  if (startDate && endDate) {
    where.startTime = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  // 获取总数
  const total = await prisma.tournament.count({ where });

  // 获取锦标赛列表
  const tournaments = await prisma.tournament.findMany({
    where,
    include: {
      club: {
        select: { name: true }
      },
      blindStructure: {
        select: { name: true }
      },
      payoutStructure: {
        select: { name: true }
      },
      players: {
        select: {
          id: true,
          userId: true,
          registrationTime: true,
          user: {
            select: { name: true, image: true }
          }
        }
      },
      _count: {
        select: { players: true }
      }
    },
    orderBy: { [orderBy!]: orderDir },
    skip: (page! - 1) * limit!,
    take: limit
  });

  return createPaginatedResponse(tournaments, page!, limit!, total);
});

// POST /api/tournaments - 创建新锦标赛
export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await validateSession();
  
  const body = await validateRequestBody<{
    clubId: string;
    name: string;
    description?: string;
    gameType: GameType;
    buyIn: number;
    fee: number;
    rebuyAmount?: number;
    addonAmount?: number;
    startingStack: number;
    startTime: string;
    lateRegEndTime?: string;
    estimatedDuration?: number;
    minPlayers: number;
    maxPlayers?: number;
    blindStructureId: string;
    payoutStructureId: string;
    tags?: string[];
  }>(request, [
    'clubId',
    'name',
    'gameType',
    'buyIn',
    'fee',
    'startingStack',
    'startTime',
    'minPlayers',
    'blindStructureId',
    'payoutStructureId'
  ]);

  // 验证权限 - 需要管理员以上权限创建锦标赛
  await validateClubPermission(session.user.id, body.clubId, 'MANAGER');

  // 验证盲注结构和支付结构是否属于同一俱乐部
  const [blindStructure, payoutStructure] = await Promise.all([
    prisma.blindStructure.findFirst({
      where: { id: body.blindStructureId, clubId: body.clubId }
    }),
    prisma.payoutStructure.findFirst({
      where: { id: body.payoutStructureId, clubId: body.clubId }
    })
  ]);

  if (!blindStructure || !payoutStructure) {
    throw new ApiError('Invalid blind structure or payout structure', 400);
  }

  // 验证时间
  const startTime = new Date(body.startTime);
  if (startTime <= new Date()) {
    throw new ApiError('Start time must be in the future', 400);
  }

  let lateRegEndTime: Date | undefined;
  if (body.lateRegEndTime) {
    lateRegEndTime = new Date(body.lateRegEndTime);
    if (lateRegEndTime <= startTime) {
      throw new ApiError('Late registration end time must be after start time', 400);
    }
  }

  // 创建锦标赛
  const tournament = await prisma.tournament.create({
    data: {
      clubId: body.clubId,
      name: body.name,
      description: body.description,
      gameType: body.gameType,
      buyIn: formatAmount(body.buyIn),
      fee: formatAmount(body.fee),
      rebuyAmount: body.rebuyAmount ? formatAmount(body.rebuyAmount) : undefined,
      addonAmount: body.addonAmount ? formatAmount(body.addonAmount) : undefined,
      startingStack: body.startingStack,
      startTime,
      lateRegEndTime,
      estimatedDuration: body.estimatedDuration,
      minPlayers: body.minPlayers,
      maxPlayers: body.maxPlayers,
      blindStructureId: body.blindStructureId,
      payoutStructureId: body.payoutStructureId,
      tags: body.tags || [],
      status: TournamentStatus.SCHEDULED
    },
    include: {
      club: {
        select: { name: true }
      },
      blindStructure: {
        select: { name: true }
      },
      payoutStructure: {
        select: { name: true }
      },
      _count: {
        select: { players: true }
      }
    }
  });

  return createSuccessResponse(tournament, 'Tournament created successfully');
});
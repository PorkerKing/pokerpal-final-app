// API 路由: /api/tournaments/[id]
// 处理单个锦标赛的操作

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  validateRequestBody,
  createSuccessResponse,
  createErrorResponse,
  ApiError,
  formatAmount
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { TournamentStatus } from '@prisma/client';

// GET /api/tournaments/[id] - 获取锦标赛详情
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      club: {
        select: { name: true, timezone: true, currency: true }
      },
      blindStructure: {
        select: { name: true, levels: true }
      },
      payoutStructure: {
        select: { name: true, payouts: true }
      },
      players: {
        include: {
          user: {
            select: { name: true, image: true }
          }
        },
        orderBy: { registrationTime: 'asc' }
      },
      _count: {
        select: { players: true }
      }
    }
  });

  if (!tournament) {
    throw new ApiError('Tournament not found', 404);
  }

  return createSuccessResponse(tournament);
});

// PUT /api/tournaments/[id] - 更新锦标赛
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    select: { clubId: true, status: true }
  });

  if (!tournament) {
    throw new ApiError('Tournament not found', 404);
  }

  // 验证权限
  await validateClubPermission((session as any).user.id, tournament.clubId, 'MANAGER');

  const body = await validateRequestBody<{
    name?: string;
    description?: string;
    startTime?: string;
    lateRegEndTime?: string;
    estimatedDuration?: number;
    maxPlayers?: number;
    tags?: string[];
    status?: TournamentStatus;
  }>(request);

  // 只有未开始的锦标赛可以修改基本信息
  if (tournament.status !== TournamentStatus.SCHEDULED && 
      tournament.status !== TournamentStatus.REGISTERING) {
    // 已开始的锦标赛只能修改状态
    if (body.name || body.description || body.startTime) {
      throw new ApiError('Cannot modify tournament details after it has started', 400);
    }
  }

  // 验证时间
  let startTime: Date | undefined;
  let lateRegEndTime: Date | undefined;

  if (body.startTime) {
    startTime = new Date(body.startTime);
    if (startTime <= new Date() && tournament.status === TournamentStatus.SCHEDULED) {
      throw new ApiError('Start time must be in the future', 400);
    }
  }

  if (body.lateRegEndTime) {
    lateRegEndTime = new Date(body.lateRegEndTime);
    const compareTime = startTime || new Date();
    if (lateRegEndTime <= compareTime) {
      throw new ApiError('Late registration end time must be after start time', 400);
    }
  }

  const updatedTournament = await prisma.tournament.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      startTime,
      lateRegEndTime,
      estimatedDuration: body.estimatedDuration,
      maxPlayers: body.maxPlayers,
      tags: body.tags,
      status: body.status
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

  return createSuccessResponse(updatedTournament, 'Tournament updated successfully');
});

// DELETE /api/tournaments/[id] - 删除锦标赛
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    select: { 
      clubId: true, 
      status: true,
      _count: { select: { players: true } }
    }
  });

  if (!tournament) {
    throw new ApiError('Tournament not found', 404);
  }

  // 验证权限
  await validateClubPermission((session as any).user.id, tournament.clubId, 'ADMIN');

  // 只有未开始且无人报名的锦标赛可以删除
  if (tournament.status !== TournamentStatus.SCHEDULED) {
    throw new ApiError('Can only delete scheduled tournaments', 400);
  }

  if (tournament._count.players > 0) {
    throw new ApiError('Cannot delete tournament with registered players', 400);
  }

  await prisma.tournament.delete({
    where: { id: params.id }
  });

  return createSuccessResponse(null, 'Tournament deleted successfully');
});
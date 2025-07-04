// API 路由: /api/clubs/[id]
// 处理单个俱乐部的操作

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  validateAdminPermission,
  validateOwnerPermission,
  validateRequestBody,
  createSuccessResponse,
  ApiError
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { MemberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/clubs/[id] - 获取俱乐部详情
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('includeStats') === 'true';
  
  const club = await prisma.club.findUnique({
    where: { id: params.id },
    include: {
      aiPersona: true,
      membershipTiers: {
        where: { isActive: true },
        orderBy: { level: 'asc' }
      },
      _count: {
        select: {
          members: {
            where: { status: MemberStatus.ACTIVE }
          },
          tournaments: true,
          ringGameTables: true,
          announcements: {
            where: { isActive: true }
          }
        }
      },
      ...(includeStats && {
        members: {
          where: { status: MemberStatus.ACTIVE },
          select: {
            id: true,
            role: true,
            joinDate: true,
            vipLevel: true,
            user: {
              select: { name: true, image: true }
            }
          },
          orderBy: { joinDate: 'desc' },
          take: 10 // 最新加入的10个成员
        },
        tournaments: {
          where: {
            startTime: {
              gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 最近30天
            }
          },
          select: {
            id: true,
            name: true,
            startTime: true,
            status: true,
            _count: { select: { players: true } }
          },
          orderBy: { startTime: 'desc' },
          take: 5
        }
      })
    }
  });

  if (!club) {
    throw new ApiError('Club not found', 404);
  }

  return createSuccessResponse(club);
});

// PUT /api/clubs/[id] - 更新俱乐部信息
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();

  // 验证管理员权限
  await validateAdminPermission((session as any).user.id, params.id);

  const body = await validateRequestBody<{
    name?: string;
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
  }>(request);

  // 如果要更改名称，检查唯一性
  if (body.name) {
    const existingClub = await prisma.club.findFirst({
      where: {
        name: body.name,
        id: { not: params.id }
      }
    });

    if (existingClub) {
      throw new ApiError('Club name already exists', 400);
    }
  }

  const updatedClub = await prisma.club.update({
    where: { id: params.id },
    data: body,
    include: {
      aiPersona: true,
      _count: {
        select: {
          members: {
            where: { status: MemberStatus.ACTIVE }
          },
          tournaments: true,
          ringGameTables: true
        }
      }
    }
  });

  return createSuccessResponse(updatedClub, 'Club updated successfully');
});

// DELETE /api/clubs/[id] - 删除俱乐部
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();

  // 验证所有者权限
  await validateOwnerPermission((session as any).user.id, params.id);

  // 检查俱乐部是否有活跃的锦标赛或现金局
  const activeActivities = await prisma.club.findUnique({
    where: { id: params.id },
    select: {
      tournaments: {
        where: {
          status: {
            in: ['SCHEDULED', 'REGISTERING', 'IN_PROGRESS']
          }
        },
        take: 1
      },
      ringGameTables: {
        where: {
          isActive: true
        },
        take: 1
      }
    }
  });

  if (activeActivities?.tournaments.length || activeActivities?.ringGameTables.length) {
    throw new ApiError('Cannot delete club with active tournaments or ring games', 400);
  }

  // 删除俱乐部（级联删除会处理相关数据）
  await prisma.club.delete({
    where: { id: params.id }
  });

  return createSuccessResponse(null, 'Club deleted successfully');
});
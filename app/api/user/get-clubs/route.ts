// API 路由: /api/user/get-clubs
// 获取用户参与的俱乐部列表

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  createSuccessResponse,
  ApiError
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { MemberStatus } from '@prisma/client';

// GET /api/user/get-clubs - 获取用户参与的俱乐部列表
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await validateSession();

  // 获取用户参与的俱乐部
  const memberships = await prisma.clubMember.findMany({
    where: {
      userId: (session as any).user.id,
      status: MemberStatus.ACTIVE
    },
    include: {
      club: {
        include: {
          aiPersona: {
            select: { 
              name: true, 
              avatarUrl: true 
            }
          },
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
      }
    },
    orderBy: { joinDate: 'desc' }
  });

  // 转换为前端需要的格式
  const clubs = memberships.map(membership => ({
    id: membership.club.id,
    name: membership.club.name,
    description: membership.club.description,
    logoUrl: membership.club.logoUrl,
    coverImageUrl: membership.club.coverImageUrl,
    timezone: membership.club.timezone,
    currency: membership.club.currency,
    isActive: membership.club.isActive,
    aiPersona: membership.club.aiPersona,
    memberCount: membership.club._count.members,
    tournamentCount: membership.club._count.tournaments,
    ringGameTableCount: membership.club._count.ringGameTables,
    // 用户在该俱乐部的信息
    userMembership: {
      role: membership.role,
      balance: membership.balance,
      vipLevel: membership.vipLevel,
      joinDate: membership.joinDate
    }
  }));

  return createSuccessResponse({ clubs });
});
// API 路由: /api/dashboard/summary
// 提供仪表盘汇总数据

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  createSuccessResponse,
  ApiError
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { MemberStatus, TournamentStatus } from '@prisma/client';

// GET /api/dashboard/summary - 获取仪表盘汇总数据
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await validateSession();
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  if (!clubId) {
    throw new ApiError('Club ID is required', 400);
  }

  // 验证用户是否是俱乐部成员
  const membership = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: clubId,
        userId: (session.user as any).id
      }
    }
  });

  if (!membership) {
    throw new ApiError('Access denied. Not a club member.', 403);
  }

  // 获取基础统计数据
  const [
    memberStats,
    tournamentStats,
    ringGameStats,
    recentActivity,
    financialSummary
  ] = await Promise.all([
    // 会员统计
    prisma.clubMember.groupBy({
      by: ['status'],
      where: { clubId },
      _count: true
    }),
    
    // 锦标赛统计
    prisma.tournament.groupBy({
      by: ['status'],
      where: { clubId },
      _count: true
    }),
    
    // 圆桌游戏统计
    prisma.ringGameTable.findMany({
      where: { clubId },
      include: {
        _count: {
          select: { sessions: { where: { endTime: null } } }
        }
      }
    }),
    
    // 最近活动（最新的10个锦标赛）
    prisma.tournament.findMany({
      where: { clubId },
      include: {
        _count: { select: { players: true } }
      },
      orderBy: { startTime: 'desc' },
      take: 5
    }),
    
    // 财务汇总（如果用户有权限）
    ['OWNER', 'ADMIN', 'CASHIER'].includes(membership.role) ? 
      prisma.transaction.groupBy({
        by: ['type'],
        where: { 
          clubId,
          timestamp: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)) // 最近30天
          }
        },
        _sum: { amount: true }
      }) : null
  ]);

  // 处理会员统计
  const totalMembers = memberStats.reduce((sum, stat) => sum + stat._count, 0);
  const activeMembers = memberStats.find(s => s.status === MemberStatus.ACTIVE)?._count || 0;

  // 处理锦标赛统计
  const totalTournaments = tournamentStats.reduce((sum, stat) => sum + stat._count, 0);
  const activeTournaments = tournamentStats.filter(s => 
    [TournamentStatus.SCHEDULED, TournamentStatus.REGISTERING, TournamentStatus.IN_PROGRESS].includes(s.status as TournamentStatus)
  ).reduce((sum, stat) => sum + stat._count, 0);

  // 处理圆桌游戏统计
  const totalRingTables = ringGameStats.length;
  const activeRingTables = ringGameStats.filter(table => 
    table._count.sessions > 0
  ).length;

  // 处理财务数据
  let dailyRevenue = 0;
  let monthlyRevenue = 0;
  
  if (financialSummary) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // 今日收入（只统计收入类型的交易）
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        clubId,
        timestamp: { gte: startOfDay },
        type: { in: ['TOURNAMENT_BUYIN', 'STORE_PURCHASE'] }
      }
    });
    
    dailyRevenue = todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    // 月度收入
    monthlyRevenue = financialSummary
      .filter(s => ['TOURNAMENT_BUYIN', 'STORE_PURCHASE'].includes(s.type))
      .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);
  }

  const summary = {
    // 会员概览
    members: {
      total: totalMembers,
      active: activeMembers,
      growth: 0 // TODO: 计算增长率
    },
    
    // 锦标赛概览
    tournaments: {
      total: totalTournaments,
      active: activeTournaments,
      upcoming: tournamentStats.find(s => s.status === TournamentStatus.SCHEDULED)?._count || 0
    },
    
    // 圆桌游戏概览
    ringGames: {
      total: totalRingTables,
      active: activeRingTables,
      waiting: totalRingTables - activeRingTables
    },
    
    // 财务概览（仅对有权限的用户显示）
    finance: ['OWNER', 'ADMIN', 'CASHIER'].includes(membership.role) ? {
      dailyRevenue,
      monthlyRevenue,
      currency: 'USD' // TODO: 从俱乐部设置获取
    } : null,
    
    // 最近活动
    recentActivity: recentActivity.map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      type: 'tournament',
      startTime: tournament.startTime,
      status: tournament.status,
      playerCount: tournament._count.players
    })),
    
    // 用户权限
    userRole: membership.role,
    canViewFinance: ['OWNER', 'ADMIN', 'CASHIER'].includes(membership.role)
  };

  return createSuccessResponse(summary);
});
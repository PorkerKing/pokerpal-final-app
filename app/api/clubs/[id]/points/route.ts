import { NextRequest } from 'next/server';
import { validateClubPermission, createErrorResponse } from '@/lib/auth-middleware';
import prisma from '@/lib/prisma';

// GET /api/clubs/[id]/points - 获取俱乐部积分概览
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id;
    
    // 验证权限（需要MANAGER或更高权限才能查看积分数据）
    const authResult = await validateClubPermission(request, clubId, ['MANAGER', 'ADMIN', 'OWNER']);
    if (!authResult.success) {
      return createErrorResponse((authResult as any).error, (authResult as any).status);
    }

    // 获取俱乐部所有成员的积分统计
    const membersWithPoints = await prisma.clubMember.findMany({
      where: { clubId },
      select: {
        id: true,
        points: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        points: 'desc'
      }
    });

    // 计算统计数据
    const totalPoints = membersWithPoints.reduce((sum, member) => sum + (member.points || 0), 0);
    const averagePoints = membersWithPoints.length > 0 ? Math.round(totalPoints / membersWithPoints.length) : 0;
    const topMember = membersWithPoints[0] || null;

    // 获取最近的积分交易记录
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: {
          in: ['POINTS_EARNED', 'POINTS_REDEMPTION']
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20
    });

    return Response.json({
      success: true,
      data: {
        overview: {
          totalMembers: membersWithPoints.length,
          totalPoints,
          averagePoints,
          topMember: topMember ? {
            name: topMember.user.name,
            points: topMember.points
          } : null
        },
        topMembers: membersWithPoints.slice(0, 10).map(member => ({
          name: member.user.name,
          email: member.user.email,
          points: member.points || 0
        })),
        recentTransactions: recentTransactions.map(tx => ({
          id: tx.id,
          userName: tx.user.name,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          timestamp: tx.timestamp
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching points overview:', error);
    return createErrorResponse('获取积分数据失败', 500);
  }
}

// POST /api/clubs/[id]/points - 批量操作积分
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id;
    
    // 验证权限（需要ADMIN或更高权限才能批量操作积分）
    const authResult = await validateClubPermission(request, clubId, ['ADMIN', 'OWNER']);
    if (!authResult.success) {
      return createErrorResponse((authResult as any).error, (authResult as any).status);
    }

    const body = await request.json();
    const { action, userIds, points, reason } = body;

    // 验证输入
    if (!action || !['add', 'subtract', 'set'].includes(action)) {
      return createErrorResponse('无效的操作类型', 400);
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return createErrorResponse('必须指定用户ID列表', 400);
    }

    if (typeof points !== 'number' || points < 0) {
      return createErrorResponse('积分数量必须为非负数', 400);
    }

    if (!reason || reason.trim().length === 0) {
      return createErrorResponse('必须提供操作原因', 400);
    }

    // 验证所有用户都是俱乐部成员
    const memberships = await prisma.clubMember.findMany({
      where: {
        clubId,
        userId: { in: userIds }
      }
    });

    if (memberships.length !== userIds.length) {
      return createErrorResponse('部分用户不是俱乐部成员', 400);
    }

    // 批量更新积分
    const results = await prisma.$transaction(async (tx) => {
      const updateResults = [];

      for (const membership of memberships) {
        const currentPoints = membership.points || 0;
        let newPoints = currentPoints;

        switch (action) {
          case 'add':
            newPoints = currentPoints + points;
            break;
          case 'subtract':
            newPoints = Math.max(0, currentPoints - points);
            break;
          case 'set':
            newPoints = points;
            break;
        }

        // 更新积分
        await tx.clubMember.update({
          where: { id: membership.id },
          data: { points: newPoints }
        });

        // 创建交易记录
        await tx.transaction.create({
          data: {
            userId: membership.userId,
            clubId,
            type: action === 'subtract' ? 'POINTS_REDEMPTION' : 'POINTS_EARNED',
            amount: action === 'subtract' ? -Math.abs(currentPoints - newPoints) : Math.abs(newPoints - currentPoints),
            balanceBefore: currentPoints,
            balanceAfter: newPoints,
            description: `批量操作：${reason}`,
            reference: `BATCH-${action.toUpperCase()}-${Date.now()}`
          }
        });

        updateResults.push({
          userId: membership.userId,
          previousPoints: currentPoints,
          newPoints,
          change: newPoints - currentPoints
        });
      }

      return updateResults;
    });

    return Response.json({
      success: true,
      message: `成功为 ${userIds.length} 个用户执行积分操作`,
      data: {
        action,
        affectedUsers: results.length,
        results
      }
    });

  } catch (error) {
    console.error('Error batch updating points:', error);
    return createErrorResponse('批量更新积分失败', 500);
  }
}
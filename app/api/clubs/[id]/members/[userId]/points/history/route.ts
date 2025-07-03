import { NextRequest } from 'next/server';
import { validateClubPermission, createErrorResponse } from '@/lib/auth-middleware';
import prisma from '@/lib/prisma';

// GET /api/clubs/[id]/members/[userId]/points/history - 获取用户积分历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const clubId = params.id;
    const targetUserId = params.userId;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 验证权限
    const authResult = await validateClubPermission(request, clubId, ['MEMBER']);
    if (!authResult.success) {
      return createErrorResponse((authResult as any).error, (authResult as any).status);
    }

    // 权限检查：用户只能查看自己的积分历史，管理员可以查看所有人的
    const isAdmin = ['MANAGER', 'ADMIN', 'OWNER'].includes((authResult as any).membership.role);
    if (!isAdmin && (authResult as any).user.id !== targetUserId) {
      return createErrorResponse('您只能查看自己的积分历史', 403);
    }

    // 验证目标用户是否为俱乐部成员
    const targetMembership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: targetUserId
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!targetMembership) {
      return createErrorResponse('目标用户不是俱乐部成员', 404);
    }

    // 获取积分历史记录
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: targetUserId,
          clubId,
          type: {
            in: ['POINTS_EARNED', 'POINTS_REDEMPTION']
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: {
          userId: targetUserId,
          clubId,
          type: {
            in: ['POINTS_EARNED', 'POINTS_REDEMPTION']
          }
        }
      })
    ]);

    // 计算统计数据
    const stats = await prisma.transaction.aggregate({
      where: {
        userId: targetUserId,
        clubId,
        type: {
          in: ['POINTS_EARNED', 'POINTS_REDEMPTION']
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const earnedTotal = await prisma.transaction.aggregate({
      where: {
        userId: targetUserId,
        clubId,
        type: 'POINTS_EARNED'
      },
      _sum: {
        amount: true
      }
    });

    const redeemedTotal = await prisma.transaction.aggregate({
      where: {
        userId: targetUserId,
        clubId,
        type: 'POINTS_REDEMPTION'
      },
      _sum: {
        amount: true
      }
    });

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      success: true,
      data: {
        user: {
          name: targetMembership.user.name,
          email: targetMembership.user.email,
          currentPoints: targetMembership.points || 0
        },
        statistics: {
          totalTransactions: stats._count.id || 0,
          totalEarned: Number(earnedTotal._sum.amount || 0),
          totalRedeemed: Math.abs(Number(redeemedTotal._sum.amount || 0)),
          netPoints: Number(earnedTotal._sum.amount || 0) + Number(redeemedTotal._sum.amount || 0)
        },
        transactions: transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          balanceBefore: tx.balanceBefore,
          balanceAfter: tx.balanceAfter,
          description: tx.description,
          reference: tx.reference,
          timestamp: tx.timestamp,
          isEarned: tx.type === 'POINTS_EARNED'
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching points history:', error);
    return createErrorResponse('获取积分历史失败', 500);
  }
}
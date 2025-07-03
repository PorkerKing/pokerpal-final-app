import { NextRequest } from 'next/server';
import { validateClubPermission, createErrorResponse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// POST /api/clubs/[id]/members/[userId]/points/earn - 奖励积分
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const clubId = params.id;
    const targetUserId = params.userId;
    
    // 验证权限（需要MANAGER或更高权限才能奖励积分）
    const authResult = await validateClubPermission(request, clubId, ['MANAGER', 'ADMIN', 'OWNER']);
    if (!authResult.success) {
      return createErrorResponse(authResult.error, authResult.status);
    }

    const body = await request.json();
    const { points, reason } = body;

    // 验证输入
    if (!points || points <= 0) {
      return createErrorResponse('积分数量必须大于0', 400);
    }

    if (!reason || reason.trim().length === 0) {
      return createErrorResponse('必须提供获得积分的原因', 400);
    }

    // 验证目标用户是否为俱乐部成员
    const targetMembership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: targetUserId
        }
      }
    });

    if (!targetMembership) {
      return createErrorResponse('目标用户不是俱乐部成员', 404);
    }

    // 开始事务：增加积分并记录交易
    const result = await prisma.$transaction(async (tx) => {
      const currentPoints = targetMembership.points || 0;
      const newPoints = currentPoints + points;

      // 更新积分
      const updatedMembership = await tx.clubMember.update({
        where: {
          clubId_userId: {
            clubId,
            userId: targetUserId
          }
        },
        data: {
          points: newPoints
        }
      });

      // 创建交易记录
      await tx.transaction.create({
        data: {
          userId: targetUserId,
          clubId,
          type: 'POINTS_EARNED',
          amount: points,
          balanceBefore: currentPoints,
          balanceAfter: newPoints,
          description: `积分奖励：${reason}`,
          reference: `POINTS-EARN-${Date.now()}`
        }
      });

      return {
        previousPoints: currentPoints,
        newPoints,
        pointsEarned: points
      };
    });

    return Response.json({
      success: true,
      message: `成功奖励 ${points} 积分`,
      data: result
    });

  } catch (error) {
    console.error('Error earning points:', error);
    return createErrorResponse('奖励积分失败，请稍后重试', 500);
  }
}
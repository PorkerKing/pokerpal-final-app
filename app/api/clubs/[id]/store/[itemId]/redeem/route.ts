import { NextRequest } from 'next/server';
import { validateClubPermission, createErrorResponse } from '@/lib/auth-middleware';
import prisma from '@/lib/prisma';

// POST /api/clubs/[id]/store/[itemId]/redeem - 兑换商城物品
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const clubId = params.id;
    const itemId = params.itemId;
    
    // 验证用户权限
    const authResult = await validateClubPermission(request, clubId, ['MEMBER']);
    if (!authResult.success) {
      return createErrorResponse((authResult as any).error, (authResult as any).status);
    }

    // 开始数据库事务
    const result = await prisma.$transaction(async (tx) => {
      // 获取商品信息
      const item = await tx.storeItem.findUnique({
        where: { id: itemId, clubId }
      });

      if (!item) {
        throw new Error('商品不存在');
      }

      if (!item.isActive) {
        throw new Error('商品已下架');
      }

      if (item.stock <= 0) {
        throw new Error('商品库存不足');
      }

      // 获取用户会员信息
      const membership = await tx.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId,
            userId: (authResult as any).user.id
          }
        }
      });

      if (!membership) {
        throw new Error('用户不是俱乐部会员');
      }

      // 检查积分是否足够
      const currentPoints = membership.points || 0;
      if (currentPoints < ((item.pointsRequired || 0) || 0)) {
        throw new Error(`积分不足，需要 ${(item.pointsRequired || 0) || 0} 积分，您当前有 ${currentPoints} 积分`);
      }

      // 扣除积分
      await tx.clubMember.update({
        where: {
          clubId_userId: {
            clubId,
            userId: (authResult as any).user.id
          }
        },
        data: {
          points: currentPoints - (item.pointsRequired || 0)
        }
      });

      // 减少商品库存
      await tx.storeItem.update({
        where: { id: itemId },
        data: {
          stock: item.stock - 1
        }
      });

      // 创建兑换记录
      const redemption = await tx.storeRedemption.create({
        data: {
          userId: (authResult as any).user.id,
          clubId,
          storeItemId: itemId,
          pointsSpent: (item.pointsRequired || 0),
          status: 'PENDING'
        }
      });

      // 创建交易记录
      await tx.transaction.create({
        data: {
          userId: (authResult as any).user.id,
          clubId,
          type: 'POINTS_REDEMPTION',
          amount: -(item.pointsRequired || 0),
          balanceBefore: currentPoints,
          balanceAfter: currentPoints - (item.pointsRequired || 0),
          description: `兑换商品：${item.name}`,
          reference: `REDEMPTION-${redemption.id}`
        }
      });

      return {
        redemption,
        newPointsBalance: currentPoints - (item.pointsRequired || 0)
      };
    });

    return Response.json({
      success: true,
      message: '兑换成功！请联系俱乐部工作人员领取商品。',
      data: {
        redemptionId: result.redemption.id,
        newPointsBalance: result.newPointsBalance
      }
    });

  } catch (error) {
    console.error('Error redeeming item:', error);
    
    // 如果是业务逻辑错误，返回具体错误信息
    if (error instanceof Error && error.message.includes('积分不足')) {
      return createErrorResponse(error.message, 400);
    }
    if (error instanceof Error && (
      error.message.includes('商品不存在') ||
      error.message.includes('商品已下架') ||
      error.message.includes('库存不足')
    )) {
      return createErrorResponse(error.message, 400);
    }

    return createErrorResponse('兑换失败，请稍后重试', 500);
  }
}
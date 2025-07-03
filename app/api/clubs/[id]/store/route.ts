import { NextRequest } from 'next/server';
import { validateClubPermission, createErrorResponse } from '@/lib/auth-middleware';
import prisma from '@/lib/prisma';

// GET /api/clubs/[id]/store - 获取商城物品列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id;
    
    // 验证用户权限（任何会员都可以查看商城）
    const authResult = await validateClubPermission(request, clubId, ['MEMBER']);
    if (!authResult.success) {
      return createErrorResponse((authResult as any).error, (authResult as any).status);
    }

    // 获取商城物品
    const items = await prisma.storeItem.findMany({
      where: {
        clubId,
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { pointsRequired: 'asc' }
      ]
    });

    // 获取用户积分
    const userPoints = (authResult as any).membership?.points || 0;

    return Response.json({
      success: true,
      data: {
        items,
        userPoints
      }
    });

  } catch (error) {
    console.error('Error fetching store items:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
// API 路由: /api/clubs/[id]/payout-structures
// 获取俱乐部的支付结构

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  createSuccessResponse,
  ApiError
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// GET /api/clubs/[id]/payout-structures - 获取支付结构列表
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();
  
  // 验证俱乐部权限
  await validateClubPermission(session.user.id, params.id);

  const payoutStructures = await prisma.payoutStructure.findMany({
    where: { clubId: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      payouts: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return createSuccessResponse({ items: payoutStructures });
});